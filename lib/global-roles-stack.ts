import { Stack, StackProps } from 'aws-cdk-lib';
import { AccountPrincipal, CompositePrincipal, Effect, IRole, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Environments } from '../config/environments';
import { ConnectionArn } from '../config/constants';

export class GlobalRolesStack extends Stack {
    public connectionRole: IRole;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const connectionRole = new Role(this, 'WorkbenchggConnectionRole', {
            roleName: 'WorkbenchggConnectionRole',
            assumedBy: new ServicePrincipal('codebuild.amazonaws.com'),
            // assumedBy: new CompositePrincipal(

            //     new AccountPrincipal(Environments.AppDev.id),
            //     new AccountPrincipal(Environments.AppProd.id),
            // ),
        });

        connectionRole.assumeRolePolicy?.addStatements(new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [ new ServicePrincipal('codebuild.amazonaws.com') ],
            actions: [ 'sts:AssumeRole' ],
            conditions: {
                StringEquals: {
                    'aws:SourceAccount': [ Environments.AppDev.id, Environments.AppProd.id ],
                }
            }
        }));

        connectionRole.addToPolicy(new PolicyStatement({
            actions: [
                'codeconnections:UseConnection',
                'codeconnections:GetConnection',
                'codeconnections:ListConnections',
            ],
            resources: [ ConnectionArn ],
        }));

        this.connectionRole = connectionRole;
    }
}
