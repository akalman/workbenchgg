import { Stack, StackProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { Fabrics } from '../config/clients';
import { RootConnectionArn, DevConnectionArn } from '../config/constants';
import { Environments } from '../config/environments';
import { ApplicationStage } from './application-stage';
import { GlobalResourcesStage } from './global-resources-stage';

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, 'WorkbenchggPipeline', {
            pipelineName: 'WorkbenchggPipeline',
            crossAccountKeys: true,
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.connection('akalman/workbenchgg', 'master', {
                    connectionArn: RootConnectionArn,
                    actionName: 'workbenchgg-source',
                }),
                commands: ['npm ci', 'npm run build', 'npx cdk synth']
            })
        });

        pipeline.addStage(new GlobalResourcesStage(this, 'WorkbenchggNetworking', {
            env: props.env,
        }));

        pipeline.addStage(new ApplicationStage(this, 'WorkbenchggApplication-Dev', {
            env: {
                account: Environments.AppDev.id,
                region: Environments.AppDev.region,
            },
            pipelineEnv: Environments.AppDev,
            devEnv: Environments.ClientSandboxDev,
            prodEnv: Environments.ClientSandboxDev,
            fabric: Fabrics.Sandbox,
            connection: DevConnectionArn,
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