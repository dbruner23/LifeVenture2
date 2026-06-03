import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';

interface DataStackProps extends StackProps {
  vpc: ec2.IVpc;
  lambdaSecurityGroup: ec2.ISecurityGroup;
  /** When false, RemovalPolicy.DESTROY everywhere (clean teardown for dev). */
  retainOnDestroy: boolean;
}

/**
 * Aurora Serverless v2 PostgreSQL (PostGIS). serverlessV2MinCapacity: 0 enables
 * scale-to-zero — the cluster parks at 0 ACU when idle and bills storage only.
 * App Lambdas authenticate with IAM (iamAuthentication), so no DB password is
 * fetched at runtime. PostGIS is enabled by a migration after first deploy:
 *   CREATE EXTENSION IF NOT EXISTS postgis;
 */
export class DataStack extends Stack {
  readonly cluster: rds.DatabaseCluster;
  readonly databaseName = 'lifeventure';
  readonly appDbUser = 'app';

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    this.cluster = new rds.DatabaseCluster(this, 'Db', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.of('16.6', '16'),
      }),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      writer: rds.ClusterInstance.serverlessV2('writer'),
      serverlessV2MinCapacity: 0,
      serverlessV2MaxCapacity: 2,
      defaultDatabaseName: this.databaseName,
      iamAuthentication: true,
      storageEncrypted: true,
      backup: { retention: Duration.days(props.retainOnDestroy ? 7 : 1) },
      // Dev: DESTROY for a clean `cdk destroy --all`. Prod (`-c env=prod`):
      // SNAPSHOT keeps a final backup before delete.
      removalPolicy: props.retainOnDestroy ? RemovalPolicy.SNAPSHOT : RemovalPolicy.DESTROY,
      deletionProtection: props.retainOnDestroy,
    });

    // Allow the DB-touching Lambdas (SG owned by NetworkStack) to reach Aurora.
    this.cluster.connections.allowDefaultPortFrom(
      props.lambdaSecurityGroup,
      'Lambda to Aurora',
    );
  }
}
