import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

/**
 * VPC for the data tier. PRIVATE_ISOLATED subnets only — no NAT gateway and no
 * internet gateway, which keeps fixed cost at ~$0. Lambdas in this VPC reach
 * S3 through the free gateway endpoint and Aurora over the private network.
 */
export class NetworkStack extends Stack {
  readonly vpc: ec2.Vpc;
  /** Shared SG for DB-touching Lambdas. Owned here so Data and Api both depend
   *  on Network (one direction) instead of on each other (which would cycle). */
  readonly lambdaSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    this.vpc.addGatewayEndpoint('S3Endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });

    this.lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSg', {
      vpc: this.vpc,
      description: 'DB-touching Lambdas',
      allowAllOutbound: true,
    });
  }
}
