import { Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { ClientInfo } from '../config/clients';
import { EnvironmentInfo } from '../config/environments';
import { S3DeployAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Artifact } from 'aws-cdk-lib/aws-codepipeline';
import { ConnectionArn } from '../config/constants';
import { IRole } from 'aws-cdk-lib/aws-iam';

export interface ClientStackProps extends StackProps {
    clientName: string;
    client: ClientInfo;
    pipelineEnv: EnvironmentInfo;
    devEnv: EnvironmentInfo;
    prodEnv: EnvironmentInfo;
    connectionRole: IRole;
}

export class ClientPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props: ClientStackProps) {
        super(scope, id, props);

        const bucket = new Bucket(this, `ClientPipelineBucket-${props.clientName}-${props.pipelineEnv.name}`, {
            bucketName: `ClientPipelineBucket-${props.clientName}-${props.pipelineEnv.name}`.toLowerCase(),
        });
        const output = new Artifact(`ClientPipelineOutput-${props.clientName}-${props.pipelineEnv.name}`)

        const synthStep = new CodeBuildStep(`ClientPipelineBuild-${props.clientName}-${props.pipelineEnv.name}`, {
            projectName: `ClientPipelineBuild-${props.clientName}-${props.pipelineEnv.name}`,
            input: CodePipelineSource.connection(`${props.client.author}/${props.client.package}`, props.client.branch, {
                connectionArn: ConnectionArn,
            }),
            commands: ['echo "Done."'],
            role: props.connectionRole,
        });

        const pipeline = new CodePipeline(this, `ClientPipeline-${props.clientName}-${props.pipelineEnv.name}`, {
            pipelineName: `ClientPipelineStack-${props.clientName}-${props.pipelineEnv.name}`,
            crossAccountKeys: true,
            synth: synthStep,
        });
    }
}