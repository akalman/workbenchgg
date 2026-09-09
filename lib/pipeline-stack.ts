import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { Fabrics } from '../config/clients';
import { Environments } from '../config/environments';
import { ApplicationStage } from './application-stage';
import { GlobalResourcesStage } from './global-resources-stage';

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const bucket = new Bucket(this, 'WorkbenchggStore', {
            bucketName: 'workbenchgg-store-v7',
            encryption: BucketEncryption.S3_MANAGED,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const pipeline = new CodePipeline(this, 'WorkbenchggPipeline', {
            pipelineName: 'WorkbenchggPipeline',
            crossAccountKeys: true,
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.connection('akalman/workbenchgg', 'master', {
                    connectionArn: Environments.Root.connectionArn,
                    actionName: 'workbenchgg-source',
                }),
                commands: [
                    'npm ci',
                    'npm run build',
                    'npx cdk synth',
                    'ls -al',
                    `aws s3 cp ./cdk.out/ s3://${bucket.bucketName}/workbenchgg/ --recursive`,
                ],
            }),
            codeBuildDefaults: {
                rolePolicy: [
                    new PolicyStatement({
                        effect: Effect.ALLOW,
                        actions: ['s3:PutObject'],
                        resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
                    }),
                ],
            },
        });

        const globals = new GlobalResourcesStage(this, 'WorkbenchggNetworking', {
            env: props.env,
        });
        pipeline.addStage(globals);

        pipeline.addStage(new ApplicationStage(this, 'WorkbenchggApplication-Dev', {
            env: {
                account: Environments.AppDev.id,
                region: Environments.AppDev.region,
            },
            pipelineEnv: Environments.AppDev,
            devEnv: Environments.ClientStagingDev,
            prodEnv: Environments.ClientStagingProd,
            fabric: Fabrics.Staging,
            connection: Environments.AppDev.connectionArn,
            cdkBucket: bucket,
        }));

        pipeline.addStage(
            new ApplicationStage(this, 'WorkbenchggApplication-Prod', {
                env: {
                    account: Environments.AppProd.id,
                    region: Environments.AppProd.region,
                },
                pipelineEnv: Environments.AppProd,
                devEnv: Environments.ClientLiveDev,
                prodEnv: Environments.ClientLiveProd,
                fabric: Fabrics.Live,
                connection: Environments.AppProd.connectionArn,
                cdkBucket: bucket,
            }),
            {
                pre: [
                    new ManualApprovalStep('ProdPromotion', {
                        comment: 'Triggers deploy to prod.'
                    }),
                ],
            },
        );
    }
}