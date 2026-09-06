import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from "constructs";
import { S3DeployStack } from './s3-deploy-stack';
import { EnvironmentInfo } from '../config/environments';

export interface S3DeployStageProps extends StageProps {
    clientName: string;
    environment: EnvironmentInfo;
}

export class S3DeployStage extends Stage {
    public stack: S3DeployStack;

    constructor(scope: Construct, id: string, props: S3DeployStageProps) {
        super(scope, id, props);

        const stack = new S3DeployStack(this, `ClientPipelineDeploy-${props.clientName}-${props.environment.name}`, {
            clientName: props.clientName,
            environment: props.environment,
        });
        this.stack = stack;
    }
}