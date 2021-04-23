import * as cdk from '@aws-cdk/core';
import * as eks from '@aws-cdk/aws-eks';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import { PROW_NAMESPACE } from './test-ci-stack';
import { RemovalPolicy } from '@aws-cdk/core';

export type LogBucketCompileProps = {
  logsBucketName: string
}

export type LogBucketRuntimeProps = {
  account: string;
}

export type LogBucketProps = LogBucketCompileProps & LogBucketRuntimeProps;

export class LogBucket extends cdk.Construct {
  readonly bucket: s3.Bucket;
  readonly deploymentServiceAccountRole: eks.ServiceAccount;

  constructor(scope: cdk.Construct, id: string, props: LogBucketProps) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, 'LogsBucket', {
      bucketName: props.logsBucketName || "ack-prow-logs-" + props.account,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true
    });

    // Destroy bucket if name not specifically specified
    if (props.logsBucketName === undefined) {
      this.bucket.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }

    new cdk.CfnOutput(this, 'LogsBucketCfnOutput', {
      value: this.bucket.bucketName,
      exportName: 'ProwLogsBucketName',
      description: 'S3 bucket name for the Prow logs'
    });
  }
}
