#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { DataStack } from '../lib/data-stack';
import { AuthStack } from '../lib/auth-stack';
import { ApiStack } from '../lib/api-stack';
import { CostStack } from '../lib/cost-stack';

const app = new cdk.App();

// account is undefined when no AWS creds are present — that keeps `cdk synth`
// fully offline. region defaults to Sydney (see ARCHITECTURE.md).
const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'ap-southeast-2',
};

// Dev (default): clean teardown via `cdk destroy --all`. Prod: protect data
// and users with snapshots/retain. Flip with `cdk deploy -c env=prod`.
const isProd = app.node.tryGetContext('env') === 'prod';
const retainOnDestroy = isProd;

const alertEmail = (app.node.tryGetContext('alertEmail') as string | undefined)
  ?? 'david.bruner@abley.com';

new CostStack(app, 'LifeVenture-Cost', { env, alertEmail });

const network = new NetworkStack(app, 'LifeVenture-Network', { env });

const data = new DataStack(app, 'LifeVenture-Data', {
  env,
  vpc: network.vpc,
  lambdaSecurityGroup: network.lambdaSecurityGroup,
  retainOnDestroy,
});

const auth = new AuthStack(app, 'LifeVenture-Auth', { env, retainOnDestroy });

new ApiStack(app, 'LifeVenture-Api', {
  env,
  vpc: network.vpc,
  cluster: data.cluster,
  lambdaSecurityGroup: network.lambdaSecurityGroup,
  appDbUser: data.appDbUser,
  databaseName: data.databaseName,
  userPool: auth.userPool,
  userPoolClient: auth.userPoolClient,
});

app.synth();
