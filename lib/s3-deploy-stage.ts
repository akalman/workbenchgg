import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from "constructs";
import { EnvironmentInfo } from '../config/environments';
import { S3DeployStack } from './s3-deploy-stack';

export interface S3DeployStageProps extends StageProps {
    clientName: string;
    environment: EnvironmentInfo;
    scriptRoleArn: string;
    clientSubdomain: string;
}

export class S3DeployStage extends Stage {
    public stack: S3DeployStack;

    constructor(scope: Construct, id: string, props: S3DeployStageProps) {
        super(scope, id, props);

        const stack = new S3DeployStack(this, `ClientPipelineDeploy-${props.clientName}-${props.environment.name}`, {
            clientName: props.clientName,
            environment: props.environment,
            scriptRoleArn: props.scriptRoleArn,
            clientSubdomain: props.clientSubdomain,
        });
        this.stack = stack;
    }
}