import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from "constructs";
import { Clients, Fabrics } from '../config/clients';
import { EnvironmentInfo } from '../config/environments';
import { ClientPipelineStack } from './client-pipeline-stack';
import { IRole } from 'aws-cdk-lib/aws-iam';

export interface ApplicationStageProps extends StageProps {
    pipelineEnv: EnvironmentInfo;
    devEnv: EnvironmentInfo;
    prodEnv: EnvironmentInfo;
    fabric: Fabrics;
    connectionRole: IRole;
}

export class ApplicationStage extends Stage {

    constructor(scope: Construct, id: string, props: ApplicationStageProps) {
        super(scope, id, props);

        Object.entries(Clients).forEach(([clientName, client]) => {
            if (client.fabrics.includes(props.fabric)) {
                const clientStack = new ClientPipelineStack(this, `ClientPipelineStack-${clientName}-${props.pipelineEnv.name}`, {
                    env: props.env,
                    clientName: clientName,
                    client: client,
                    pipelineEnv: props.pipelineEnv,
                    devEnv: props.devEnv,
                    prodEnv: props.prodEnv,
                    connectionRole: props.connectionRole,
                });
            }
        });
    }
}