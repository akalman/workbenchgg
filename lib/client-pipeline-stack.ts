import { Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
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
}

export class ClientPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props: ClientStackProps) {
        super(scope, id, props);

        const pipelineBucket = new Bucket(this, `ClientPipelineBucket-${props.clientName}-${props.pipelineEnv.name}`, {
            bucketName: `ClientPipelineBucket-${props.clientName}-${props.pipelineEnv.name}`.toLowerCase(),
        });

        const pipeline = new CodePipeline(this, `ClientPipeline-${props.clientName}-${props.pipelineEnv.name}`, {
            pipelineName: `ClientPipelineStack-${props.clientName}-${props.pipelineEnv.name}`,
            crossAccountKeys: true,
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.connection(`${props.client.author}/${props.client.package}`, props.client.branch, {
                    connectionArn: 'arn:aws:codeconnections:us-west-2:256157865211:connection/b8ce04c4-b9f9-4b86-b33d-24785b30ff3c',
                }),
                commands: ['echo "Done."']
            }),
        });
    }
}