# LifeVenture — Architecture

Backend, data, and infrastructure plan for LifeVenture. Two guiding constraints, in tension and deliberately balanced:

1. **Spatial is core to the product's value** — map-led discovery, filtering, and (eventually) routes must be first-class, not bolted on.
2. **Bare-minimum cost** — everything scales toward ~zero when idle.

Hosted on a personal AWS account as **CDK (TypeScript) infrastructure-as-code**.

## Locked decisions

| Decision | Choice | Rationale |
|---|---|---|
| Primary database | **PostgreSQL + PostGIS on Aurora Serverless v2 (scale-to-zero)** | Full spatial capability as the single source of truth; parks at 0 ACU when idle so idle cost ≈ storage only |
| API style | **API Gateway HTTP API + Lambda** (TypeScript handlers) | Simplest to learn/debug, one language; cheaper than REST API or AppSync |
| Region | **ap-southeast-2 (Sydney)** | Closest to Wellington NZ and early NZ/AU users (CloudFront serves media globally) |
| IaC | **AWS CDK (TypeScript)** | Matches the app's language |
| CI/CD | **GitHub Actions + OIDC role** | No long-lived AWS keys in CI |

> The CloudFront TLS certificate must be created in **us-east-1** even though everything else lives in ap-southeast-2 — an AWS requirement for CloudFront + ACM.

## Why PostGIS over DynamoDB

DynamoDB + geohash handles a viewport query and a simple "near me" radius, but hits a ceiling on exactly the things that make LifeVenture valuable:

- **Multi-predicate spatial** — "wilderness ventures, by people I follow, near here, this year" (DynamoDB indexes one dimension; the rest is post-filtered in code).
- **True nearest-N / order-by-distance** — PostGIS `<->` KNN operator on a GiST index.
- **Polygon containment** — "ventures in Italy / inside this park / inside a drawn region" via `ST_Within`.
- **Routes / GPS tracks** (the Strava angle) — linestring length, "passes near X", intersections.
- **Map clustering / density** — `ST_ClusterDBSCAN`.

Relational is also a cleaner fit for the social graph + feed than DynamoDB single-table modeling, and SQL is more forgiving of query patterns we haven't anticipated yet.

## Scope: what AWS does vs. doesn't

AWS hosts the **backend, data, media, and (optionally) a landing site + OTA update assets**. It does **not** build or distribute the native app — Expo apps are compiled with EAS Build (or locally) and shipped through the App Store / Play Store.

## Architecture

```
 Expo / React Native app
        |  HTTPS + Cognito JWT
        v
   API Gateway (HTTP API, JWT authorizer)
        |
        +-- Lambdas (non-DB): geocode, presign uploads   --> Amazon Location, S3
        |
        v   (DB-touching Lambdas, in VPC)
   Lambda (Node 20, ARM)  ---- IAM auth ---->  Aurora Serverless v2
        |                                       PostgreSQL + PostGIS
        |                                       (scale-to-zero, automated backups)
        |   VPC: PRIVATE_ISOLATED subnets, NO NAT, NO IGW
        +-- S3 access via free gateway endpoint

 Cognito User Pool (auth)

 CloudFront  -->  S3 (photo originals + thumbnails)
     ^   app uploads via presigned PUT --+
     |
 Route 53 + ACM (custom domain, TLS)      CloudWatch Logs (short retention)
```

## Service choices & cost logic

| Need | Service | Why it's the cheap choice |
|---|---|---|
| Auth | Cognito User Pool | Generous free MAU tier; no servers |
| API | API Gateway HTTP API | $1/M requests, 1M/mo free; cheaper than REST/AppSync |
| Compute | Lambda (Node 20, ARM) | Scales to zero; 1M req + 400k GB-s free every month |
| Database | Aurora Serverless v2 + PostGIS | Parks at 0 ACU when idle (storage-only ≈ cents/mo); bills compute only when active |
| Media | S3 + CloudFront | Cheap storage; CloudFront free tier ~1 TB/mo egress |
| Geocoding | Amazon Location Service | Free tier, pay-per-request after |
| DNS/TLS | Route 53 + ACM | ACM certs free; Route 53 zone $0.50/mo |
| Config | Lambda env vars + SSM Parameter Store | Free; DB uses IAM auth so no secret to store |

## Cost guard rails

The database now lives in a VPC, so the discipline is **a VPC without the expensive parts**:

1. **No NAT Gateway (~$32/mo).** DB tier runs in `PRIVATE_ISOLATED` subnets — no internet route. DB-touching Lambdas reach S3 via a **free gateway endpoint** and authenticate to Postgres with **RDS IAM auth** (token signed locally, no network call), so no NAT and no paid interface endpoints are needed. Lambdas that need other AWS APIs (Location Service, Cognito) run **outside** the VPC and never touch the DB.
2. **DB scales to zero.** Aurora Serverless v2 parks at 0 ACU after inactivity; idle cost is just storage.
3. **Log sprawl.** CloudWatch log retention set to ~14 days, not "never expire."

A **$5 AWS Budgets alarm** goes in on day one as a tripwire.

**Estimated monthly cost:** idle ≈ **$1–3** (Route 53 zone + Aurora storage + a few GB of S3). Small real usage (hundreds of users, thousands of photos) ≈ **$5–15/mo**, scaling with Aurora ACU-hours.

**Trade-off to accept:** after an idle period, the first request triggers a ~15s Aurora resume. Fine pre-launch; once traffic is steady the DB stays warm, and we can set a 0.5-ACU floor later to remove cold starts entirely (~$43/mo at that point, but you'd have users by then). Modern VPC Lambdas do **not** carry the old cold-start penalty.

## Data model (relational + PostGIS)

```
users(id pk, cognito_sub uniq, handle uniq, name, avatar_url, bio,
      home_location geography(Point,4326), created_at)

ventures(id pk, author_id -> users, title, body, genre, place_label,
         location geography(Point,4326),         -- GiST index
         cover_photo_id, duration, created_at, published_at)

photos(id pk, venture_id -> ventures, s3_key, width, height, position)
comments(id pk, venture_id -> ventures, author_id -> users, body, created_at)
follows(follower_id -> users, followee_id -> users, created_at, pk(follower,followee))
reactions(user_id -> users, venture_id -> ventures, kind, created_at, pk(user,venture,kind))

-- later, for sophisticated spatial:
routes(id pk, venture_id -> ventures, path geography(LineString,4326), distance_m)  -- GiST
regions(id pk, name, kind, boundary geography(MultiPolygon,4326))                   -- GiST
```

Representative queries this unlocks in a single statement:

- **Viewport:** `WHERE location && ST_MakeEnvelope(:minLng,:minLat,:maxLng,:maxLat,4326)`
- **Near me, ranked:** `ORDER BY location <-> ST_MakePoint(:lng,:lat) LIMIT :n`
- **Within radius:** `ST_DWithin(location, ST_MakePoint(:lng,:lat)::geography, :meters)`
- **Filtered feed:** `WHERE genre = :g AND author_id IN (SELECT followee_id FROM follows WHERE follower_id = :me) AND ST_DWithin(...)`
- **In a region:** `JOIN regions r ON ST_Within(v.location::geometry, r.boundary::geometry)`

## Media upload flow

1. App requests a presigned S3 `PUT` URL from the API (non-VPC Lambda; token signed locally).
2. App uploads the photo **directly to S3** (bytes never pass through Lambda).
3. An S3-triggered Lambda generates thumbnails with `sharp`.
4. CloudFront serves originals + thumbnails. Per-user key prefixes scope access.

## CDK project layout

```
infra/
  bin/lifeventure.ts          app + env (dev/prod) via context
  lib/network-stack.ts        VPC (PRIVATE_ISOLATED subnets) + S3 gateway endpoint
  lib/auth-stack.ts           Cognito user pool + app client
  lib/data-stack.ts           Aurora Serverless v2 (PostGIS), IAM auth, backups
  lib/media-stack.ts          S3 + CloudFront (OAC) + thumbnailer Lambda
  lib/api-stack.ts            Lambdas (NodejsFunction/esbuild) + HTTP API + JWT authorizer
  lib/dns-stack.ts            Route 53 + ACM (cert in us-east-1 for CloudFront)
```

- Stacks split by lifecycle so they deploy independently.
- DB schema/migrations managed in code (e.g. a migration runner Lambda or a tool like `node-pg-migrate`), with PostGIS enabled via `CREATE EXTENSION postgis`.
- Start with **one environment (prod)**; add `dev` later via CDK context.
- Deploy via **GitHub Actions + OIDC** (`cdk deploy` on merge). `cdk bootstrap` runs once per account/region.

## Phased rollout

- **Phase 0 — Account prep:** budget alarm, `cdk bootstrap`, GitHub OIDC deploy role.
- **Phase 1 — Network + Auth + Data + API skeleton:** VPC, Cognito, Aurora + PostGIS, migrations, a CRUD Lambda for profiles + ventures; wire the RN app to real auth and data.
- **Phase 2 — Media:** presigned uploads, CloudFront, thumbnailer; real photo galleries.
- **Phase 3 — Social + Geo:** follow graph, friend feed, PostGIS viewport/radius/filtered queries, place search via Location Service.
- **Phase 4 — Polish:** custom domain, alarms, automated backups/PITR tuning, OTA updates, optional landing page. Routes/regions tables when the Strava-style features land.

## External dependencies (non-AWS)

- **Google Maps Android API key** — required for `react-native-maps` on Android (Google Cloud, own free tier). iOS uses Apple Maps for free.
- **Expo EAS** — native builds and (optionally) OTA updates. OTA assets can later be self-hosted on the same S3 + CloudFront.

## Operating principle

Nothing is deployed to the AWS account without an explicit go-ahead — `cdk bootstrap`/`deploy`, the budget alarm, and the OIDC role all create real resources. Writing CDK code locally is safe and reversible; deployment is a deliberate, separate step.
