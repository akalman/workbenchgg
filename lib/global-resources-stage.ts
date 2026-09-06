import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from "constructs";
import { GlobalNetworkStack } from './global-network-stack';
import { GlobalRolesStack } from './global-roles-stack';
import { GlobalBucketsStack } from './global-buckets-stack';

export class GlobalResourcesStage extends Stage {
    public network: GlobalNetworkStack;
    public roles: GlobalRolesStack;
    public buckets: GlobalBucketsStack;

    constructor(scope: Construct, id: string, props: StageProps) {
        super(scope, id, props);

        const networkStack = new GlobalNetworkStack(this, 'WorkbenchggGlobalNetworkStack', {
            env: {
                account: props.env?.account,
                region: 'us-east-1',
            },
        });
        this.network = networkStack;

        const rolesStack = new GlobalRolesStack(this, 'WorkbenchggGlobalRolesStack', {
            env: props.env,
        });
        this.roles = rolesStack;

        const bucketsStack = new GlobalBucketsStack(this, 'WorkbenchggGlobalBucketsStack', {
            env: props.env,
        });
        this.buckets = bucketsStack;
    }
}