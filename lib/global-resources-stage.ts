import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from "constructs";
import { GlobalNetworkStack } from './global-network-stack';
import { GlobalRolesStack } from './global-roles-stack';
import { IRole } from 'aws-cdk-lib/aws-iam';

export class GlobalResourcesStage extends Stage {
    public connectionRole: IRole;

    constructor(scope: Construct, id: string, props: StageProps) {
        super(scope, id, props);

        const networkStack = new GlobalNetworkStack(this, 'WorkbenchggGlobalNetworkStack', {
            env: props.env,
        });

        const pipelineRolesStack = new GlobalRolesStack(this, 'WorkbenchggGlobalRolesStack', {
            env: props.env,
        })

        this.connectionRole = pipelineRolesStack.connectionRole;
    }
}