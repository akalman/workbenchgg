import { Stack, StackProps } from 'aws-cdk-lib';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { EnvironmentInfo } from '../config/environments';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export interface S3DeployStackProps extends StackProps {
    clientName: string;
    environment: EnvironmentInfo;
    scriptRoleArn: string;
}

export class S3DeployStack extends Stack {
    public bucket: IBucket;

    constructor(scope: Construct, id: string, props: S3DeployStackProps) {
        super(scope, id, props);

        const bucket = new Bucket(this, `ClientPipelineDeployStack-${props.clientName}-${props.environment.name}`, {
            bucketName: `ClientPipelineDeployStack-${props.clientName}-${props.environment.name}`.toLowerCase(),
        });
        -bucket.addToResourcePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [ new ArnPrincipal(props.scriptRoleArn) ],
            actions: [
                "s3:PutObject*",
                "s3:List*",
            ],
            resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
        }));
        this.bucket = bucket;
    }
}
