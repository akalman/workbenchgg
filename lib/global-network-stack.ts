import { Stack, StackProps } from 'aws-cdk-lib';
import { AccountPrincipal, CompositePrincipal, Role } from 'aws-cdk-lib/aws-iam';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { Environments } from '../config/environments';

export class GlobalNetworkStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const hostedZone = new HostedZone(this, 'WorkbenchggHostedZone', {
            zoneName: 'workbench.gg',
        });

        const hostedZoneEditorRole = new Role(this, 'WorkbenchggHostedZoneEditorRole', {
            roleName: 'WorkbenchggHostedZoneEditorRole',
            assumedBy: new CompositePrincipal(
                new AccountPrincipal(Environments.AppDev.id),
                new AccountPrincipal(Environments.AppProd.id),
            ),
        });

        hostedZone.grantDelegation(hostedZoneEditorRole);
    }
}
