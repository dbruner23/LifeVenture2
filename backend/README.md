# LifeVenture — Backend

Application code for the LifeVenture API: the PostGIS data layer, the SQL
schema/migrations, the Lambda handlers, and a local dev server. The same
handlers are bundled by CDK ([`../infra`](../infra)) for deployment, so what
you run locally is what ships.

## Layout

```
backend/
  docker-compose.yml      local Postgres + PostGIS (host port 5433)
  migrations/             schema (*.sql, applied in order, tracked)
  seeds/                  sample data (idempotent)
  src/
    db.ts                 pg pool — password auth locally, RDS IAM token on AWS
    migrate.ts            migration runner (npm run migrate[:seed])
    queries/ventures.ts   PostGIS list query (genre / bbox / radius filters)
    handlers/             Lambda handlers (health, ventures)
    local-server.ts       Express dev server exposing the same routes
```

## Run it locally

```bash
npm install
npm run db:up          # start PostGIS (Docker)
npm run migrate:seed   # create schema + load sample ventures
npm run dev            # local API at http://localhost:3100  (watch mode)
```

Try it:

```bash
curl http://localhost:3100/health
curl http://localhost:3100/ventures
curl "http://localhost:3100/ventures?genre=Mountains"
curl "http://localhost:3100/ventures?bbox=-12,35,30,72"          # viewport
curl "http://localhost:3100/ventures?near=13.09,67.93,500000"    # within 500km, distance-ordered
```

Stop / reset:

```bash
npm run db:down        # stop the container (keeps data)
npm run db:reset       # wipe the volume and start fresh
```

## Point the Expo app at it

Set `EXPO_PUBLIC_API_URL` in the app's `.env` (repo root), then restart Expo
with `--clear`. The host differs by target:

| Target | URL |
|---|---|
| Android emulator | `http://10.0.2.2:3100` |
| iOS simulator / web | `http://localhost:3100` |
| Physical device | `http://<your-LAN-IP>:3100` |

With it unset, the app stays on built-in mock data.

## Local vs. AWS

`db.ts` is environment-driven and unchanged between the two:

- **Local**: `DB_PASSWORD` + `DB_SSL=false` (see `.env`, port 5433).
- **AWS Lambda**: CDK sets `DB_IAM_AUTH=true` + `DB_SSL=true`; a short-lived RDS
  IAM token is generated per connection (no stored password, no NAT).

After the first AWS deploy, the same `migrations/` + `seeds/` run against Aurora
(as the master user) to create the schema and the IAM `app` role — see
[`../infra/README.md`](../infra/README.md).
