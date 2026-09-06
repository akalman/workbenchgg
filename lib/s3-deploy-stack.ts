import { Duration, Fn, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { EnvironmentInfo } from '../config/environments';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AllowedMethods, Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';

export interface S3DeployStackProps extends StackProps {
    clientName: string;
    clientSubdomain: string;
    environment: EnvironmentInfo;
    scriptRoleArn: string;
}

export class S3DeployStack extends Stack {
    public bucket: IBucket;

    constructor(scope: Construct, id: string, props: S3DeployStackProps) {
        super(scope, id, props);

        const fullDomain = `${props.clientSubdomain}.workbench.gg`;
        const certArn = Fn.importValue('WorkbenchggCertArn');
        const cert = Certificate.fromCertificateArn(this, `ClientCertRef-${props.clientName}-${props.environment.name}`, certArn)

        const bucket = new Bucket(this, `ClientPipelineDeployStack-${props.clientName}-${props.environment.name}`, {
            bucketName: `ClientPipelineDeployStack-${props.clientName}-${props.environment.name}`.toLowerCase(),
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });
        bucket.addToResourcePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [ new ArnPrincipal(props.scriptRoleArn) ],
            actions: [
                "s3:PutObject*",
                "s3:List*",
            ],
            resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
        }));
        this.bucket = bucket;

        const subdomainZone = new HostedZone(this, `ClientSubdomainZone-${props.clientName}-${props.environment.name}`, {
            zoneName: `subdomain`,
        });

        const distribution = new Distribution(this, `ClientDistribution-${props.clientName}-${props.environment.name}`, {
            defaultBehavior: {
                origin: S3BucketOrigin.withOriginAccessControl(bucket),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: AllowedMethods.ALLOW_ALL,
            },
            domainNames: [fullDomain],
            certificate: cert,
            defaultRootObject: '/index.html',
            errorResponses: [{
                httpStatus: 403,
                responseHttpStatus: 200,
                responsePagePath: '/index.html',
                ttl: Duration.minutes(10),
            }],
        });

        const record = new ARecord(this, `ClientZoneRecord-${props.clientName}-${props.environment.name}`, {
            zone: subdomainZone,
            recordName: fullDomain,
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
        });
    }
}
