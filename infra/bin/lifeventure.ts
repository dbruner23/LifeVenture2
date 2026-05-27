#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { DataStack } from '../lib/data-stack';
import { AuthStack } from '../lib/auth-stack';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();

// account is undefined when no AWS creds are present — that keeps `cdk synth`
// fully offline. region defaults to Sydney (see ARCHITECTURE.md).
const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'ap-southeast-2',
};

const network = new NetworkStack(app, 'LifeVenture-Network', { env });

const data = new DataStack(app, 'LifeVenture-Data', {
  env,
  vpc: network.vpc,
  lambdaSecurityGroup: network.lambdaSecurityGroup,
});

const auth = new AuthStack(app, 'LifeVenture-Auth', { env });

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
