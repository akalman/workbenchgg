import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from "constructs";
import { GlobalNetworkStack } from './global-network-stack';
import { GlobalRolesStack } from './global-roles-stack';

export class GlobalResourcesStage extends Stage {
    constructor(scope: Construct, id: string, props: StageProps) {
        super(scope, id, props);

        const networkStack = new GlobalNetworkStack(this, 'WorkbenchggGlobalNetworkStack', {
            env: props.env,
        });

        const pipelineRolesStack = new GlobalRolesStack(this, 'WorkbenchggGlobalRolesStack', {
            env: props.env,
        })
    }
}