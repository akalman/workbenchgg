import { Stack, StackProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { ClientInfo } from '../config/clients';
import { EnvironmentInfo } from '../config/environments';

export interface ClientStackProps extends StackProps {
    clientName: string;
    client: ClientInfo;
    pipelineEnv: EnvironmentInfo;
    devEnv: EnvironmentInfo;
    prodEnv: EnvironmentInfo;
    connection: string;
}

export class ClientPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props: ClientStackProps) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, `ClientPipeline-${props.clientName}-${props.pipelineEnv.name}`, {
            pipelineName: `ClientPipelineStack-${props.clientName}-${props.pipelineEnv.name}`,
            crossAccountKeys: true,
            selfMutation: false,
            synth: new ShellStep(`ClientPipelineBuild-${props.clientName}-${props.pipelineEnv.name}`, {
                input: CodePipelineSource.connection(`${props.client.author}/${props.client.package}`, props.client.branch, {
                    actionName: `${props.clientName}-source`,
                    connectionArn: props.connection,
                }),
                commands: ['echo "Done."'],
                primaryOutputDirectory: '.',
            }),
        });
    }
}