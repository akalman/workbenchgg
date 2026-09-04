import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from "constructs";
import { GlobalNetworkStack } from './global-network-stack';

export class GlobalNetworkStage extends Stage {

    constructor(scope: Construct, id: string, props: StageProps) {
        super(scope, id, props);

        const networkStack = new GlobalNetworkStack(this, 'WorkbenchggGlobalNetworkStack', {
            env: props.env,
        });
    }
}