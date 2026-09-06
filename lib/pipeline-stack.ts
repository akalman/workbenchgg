import { CfnParameter, Stack, StackProps, stringToCloudFormation } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { Fabrics } from '../config/clients';
import { RootConnectionArn, DevConnectionArn } from '../config/constants';
import { Environments } from '../config/environments';
import { ApplicationStage } from './application-stage';
import { GlobalResourcesStage } from './global-resources-stage';
import { Bucket } from 'aws-cdk-lib/aws-s3';

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const bucket = new Bucket(this, 'WorkbenchggStore', {
            bucketName: 'workbenchgg-store',
        });

        const pipeline = new CodePipeline(this, 'WorkbenchggPipeline', {
            pipelineName: 'WorkbenchggPipeline',
            crossAccountKeys: true,
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.connection('akalman/workbenchgg', 'master', {
                    connectionArn: RootConnectionArn,
                    actionName: 'workbenchgg-source',
                }),
                commands: ['npm ci', 'npm run build', 'npx cdk synth', 'ls -al', `aws s3 cp ./cdk.out/ s3://${bucket.bucketName}/workbenchgg/ --recursive`]
            }),
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
            connection: DevConnectionArn,
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
                connection: DevConnectionArn,
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