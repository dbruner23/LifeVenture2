import * as path from 'path';
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpUserPoolAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

interface ApiStackProps extends StackProps {
  vpc: ec2.IVpc;
  cluster: rds.DatabaseCluster;
  lambdaSecurityGroup: ec2.ISecurityGroup;
  appDbUser: string;
  databaseName: string;
  userPool: cognito.IUserPool;
  userPoolClient: cognito.IUserPoolClient;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Lambda source lives in the backend/ project (shared with the local dev
    // server). esbuild bundles each handler and its deps at synth/deploy.
    const backendRoot = path.join(__dirname, '..', '..', 'backend');
    const handlersDir = path.join(backendRoot, 'src', 'handlers');
    const commonFn = {
      runtime: Runtime.NODEJS_20_X,
      architecture: Architecture.ARM_64,
      memorySize: 256,
      timeout: Duration.seconds(15),
      projectRoot: backendRoot,
      depsLockFilePath: path.join(backendRoot, 'package-lock.json'),
      bundling: { externalModules: ['pg-native'] },
    };

    const logGroup = (id: string) =>
      new logs.LogGroup(this, id, {
        retention: logs.RetentionDays.TWO_WEEKS,
        removalPolicy: RemovalPolicy.DESTROY,
      });

    // Public, no DB — stays out of the VPC.
    const healthFn = new NodejsFunction(this, 'HealthFn', {
      ...commonFn,
      entry: path.join(handlersDir, 'health.ts'),
      logGroup: logGroup('HealthLogs'),
    });

    // DB-touching — lives in the VPC, connects to Aurora with IAM auth.
    const venturesFn = new NodejsFunction(this, 'VenturesFn', {
      ...commonFn,
      entry: path.join(handlersDir, 'ventures.ts'),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [props.lambdaSecurityGroup],
      logGroup: logGroup('VenturesLogs'),
      environment: {
        DB_HOST: props.cluster.clusterEndpoint.hostname,
        DB_PORT: props.cluster.clusterEndpoint.port.toString(),
        DB_NAME: props.databaseName,
        DB_USER: props.appDbUser,
        DB_IAM_AUTH: 'true',
        DB_SSL: 'true',
      },
    });

    // IAM-auth connect for the 'app' DB user. Network path is granted in
    // DataStack via the shared Lambda security group (avoids a stack cycle).
    props.cluster.grantConnect(venturesFn, props.appDbUser);

    // One-shot migrate Lambda: bootstraps PostGIS + app role, applies SQL.
    // Imports .sql files via esbuild's text loader, so the SQL ships in the
    // bundle. Connects as the master user via Secrets Manager.
    const migrateFn = new NodejsFunction(this, 'MigrateFn', {
      ...commonFn,
      entry: path.join(handlersDir, 'migrate.ts'),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [props.lambdaSecurityGroup],
      logGroup: logGroup('MigrateLogs'),
      timeout: Duration.minutes(3),
      bundling: { externalModules: ['pg-native'], loader: { '.sql': 'text' } },
      environment: {
        DB_HOST: props.cluster.clusterEndpoint.hostname,
        DB_PORT: props.cluster.clusterEndpoint.port.toString(),
        DB_NAME: props.databaseName,
        APP_DB_USER: props.appDbUser,
        // Resolved by CloudFormation at deploy time from Secrets Manager; the
        // Lambda just reads env vars (no SDK call, no VPC endpoint needed).
        DB_MASTER_USERNAME: props.cluster.secret!.secretValueFromJson('username').unsafeUnwrap(),
        DB_MASTER_PASSWORD: props.cluster.secret!.secretValueFromJson('password').unsafeUnwrap(),
      },
    });

    new CfnOutput(this, 'MigrateFnName', { value: migrateFn.functionName });

    const authorizer = new HttpUserPoolAuthorizer('CognitoAuthorizer', props.userPool, {
      userPoolClients: [props.userPoolClient],
    });

    const api = new HttpApi(this, 'HttpApi', {
      apiName: 'lifeventure-api',
    });

    api.addRoutes({
      path: '/health',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('HealthIntegration', healthFn),
    });

    api.addRoutes({
      path: '/ventures',
      methods: [HttpMethod.GET, HttpMethod.POST],
      integration: new HttpLambdaIntegration('VenturesIntegration', venturesFn),
      authorizer,
    });

    new CfnOutput(this, 'ApiUrl', { value: api.apiEndpoint });
  }
}
