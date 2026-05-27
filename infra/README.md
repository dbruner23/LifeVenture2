# LifeVenture — Infrastructure (CDK)

AWS CDK (TypeScript) for the LifeVenture backend. See [`../ARCHITECTURE.md`](../ARCHITECTURE.md) for the full design and cost model.

## Stacks

| Stack | Contents |
|---|---|
| `LifeVenture-Network` | VPC (PRIVATE_ISOLATED subnets, no NAT), S3 gateway endpoint, shared Lambda SG |
| `LifeVenture-Data` | Aurora Serverless v2 PostgreSQL (PostGIS, scale-to-zero, IAM auth) |
| `LifeVenture-Auth` | Cognito user pool + public mobile app client |
| `LifeVenture-Api` | HTTP API + Lambdas (`/health` public, `/ventures` Cognito-protected) |

## Local commands (no AWS account needed)

```bash
npm install
npm run synth      # compile all stacks to CloudFormation in cdk.out/
npm run diff       # diff against deployed state (needs creds)
```

`synth` runs fully offline and is the way to validate changes before deploying.

## Phase 0 — one-time account setup (when you're ready to deploy)

> Nothing below has been run yet. These steps create real AWS resources.

1. **Configure credentials** for your personal AWS account (e.g. `aws configure --profile lifeventure`), then:
   ```bash
   export AWS_PROFILE=lifeventure
   export CDK_DEFAULT_ACCOUNT=<your-account-id>
   export CDK_DEFAULT_REGION=ap-southeast-2
   ```
   (PowerShell: `$env:AWS_PROFILE = "lifeventure"`, etc.)

2. **Budget tripwire** — create a $5/month AWS Budget with an email alert in the Billing console before deploying.

3. **Bootstrap CDK** once per account/region:
   ```bash
   npm run bootstrap
   ```

4. **Deploy:**
   ```bash
   npm run deploy        # cdk deploy --all
   ```
   Note the `ApiUrl`, `UserPoolId`, and `UserPoolClientId` outputs — the app needs them.

## Phase 1 — post-deploy database bootstrap (manual, once)

IAM auth and PostGIS require a one-time setup as the master user. CDK stored the
master credentials in Secrets Manager (look for the `LifeVenture-Data` DB secret).
Connect via a bastion/Query Editor/SSM session and run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

-- App role that authenticates via IAM (no password):
CREATE USER app;
GRANT rds_iam TO app;
GRANT CONNECT ON DATABASE lifeventure TO app;
-- grant table privileges as the schema is created by migrations
```

This will be folded into an automated migration runner in a later increment.

## Teardown

```bash
npm run destroy
```

`LifeVenture-Data` is set to `RemovalPolicy.SNAPSHOT` (a final snapshot is kept)
and the Cognito pool to `RETAIN`. For a throwaway environment you want gone
completely, change those to `DESTROY` in `lib/data-stack.ts` / `lib/auth-stack.ts`
before destroying.

## Cost reminder

Idle ≈ $1–3/mo (Aurora parks at 0 ACU). The bill scales with Aurora ACU-hours
once there's steady traffic — see ARCHITECTURE.md for the breakdown and levers.
