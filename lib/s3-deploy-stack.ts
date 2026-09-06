import { Stack, StackProps } from 'aws-cdk-lib';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { EnvironmentInfo } from '../config/environments';

export interface S3DeployStackProps extends StackProps {
    clientName: string;
    environment: EnvironmentInfo;
}

export class S3DeployStack extends Stack {
    public bucket: IBucket;

    constructor(scope: Construct, id: string, props: S3DeployStackProps) {
        super(scope, id, props);

        const bucket = new Bucket(this, `ClientPipelineDeployStack-${props.clientName}-${props.environment.name}`, {
            bucketName: `ClientPipelineDeployStack-${props.clientName}-${props.environment.name}`.toLowerCase(),
        });
        this.bucket = bucket;
    }
}
