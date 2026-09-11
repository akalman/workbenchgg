import { Stack, StackProps } from 'aws-cdk-lib';
import { AccountPrincipal, ArnPrincipal, CompositePrincipal, Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { ClientInfo, Fabrics } from '../config/clients';
import { ClientPipelineEnvironmentInfo, EnvironmentInfo } from '../config/environments';
import { S3DeployStage } from './s3-deploy-stage';

export interface ClientStackProps extends StackProps {
    clientName: string;
    client: ClientInfo;
    pipelineEnv: ClientPipelineEnvironmentInfo;
    devEnv: EnvironmentInfo;
    prodEnv: EnvironmentInfo;
    connection: string;
    cdkBucket: IBucket;
    fabric: Fabrics;
}

export class ClientPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props: ClientStackProps) {
        super(scope, id, props);

        const buildRole = new Role(this, `ClientPipelineBuildRole-${props.clientName}-${props.pipelineEnv.name}`, {
            roleName: `ClientPipelineBuildRole-${props.clientName}-${props.pipelineEnv.name}`,
            assumedBy: new CompositePrincipal(
                new AccountPrincipal(props.pipelineEnv.id),
                new ServicePrincipal('codebuild.amazonaws.com'),
            ),
        });
        buildRole.addToPrincipalPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "s3:GetBucket*",
                "s3:GetObject*",
                "s3:List*",
                "s3:PutObject*",
            ],
            resources: [props.cdkBucket.bucketArn, `${props.cdkBucket.bucketArn}/*`],
        }));

        // pipeline steps

        const buildStep = new CodeBuildStep(`ClientPipelineBuild-${props.clientName}-${props.pipelineEnv.name}`, {
            input: CodePipelineSource.connection(`${props.client.author}/${props.client.package}`, props.client.branch, {
                actionName: `${props.clientName}-source`,
                connectionArn: props.connection,
            }),
            commands: [
                'ls -al',
                'aws sts get-caller-identity',
                `aws s3 cp s3://${props.cdkBucket.bucketName}/workbenchgg/ ./cdk.out/ --recursive`,
                'ls -al',
                'echo "Done."'
            ],
            role: buildRole
        });

        const devDeploy = new S3DeployStage(this, `ClientPipelineDeploy-${props.clientName}-${props.devEnv.name}`, {
            env: {
                account: props.devEnv.id,
                region: props.devEnv.region,
            },
            clientName: props.clientName,
            environment: props.devEnv,
            scriptRoleArn: buildRole.roleArn,
            clientSubdomain: `${props.client.subdomain}.dev${props.fabric == Fabrics.Staging ? '.staging' : ''}`,
        });

        buildRole.addToPrincipalPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "s3:GetBucket*",
                "s3:GetObject*",
                "s3:List*",
                "s3:PutObject*",
            ],
            resources: [devDeploy.stack.bucket.bucketArn, `${devDeploy.stack.bucket.bucketArn}/*`],
        }));

        const prodDeploy = new S3DeployStage(this, `ClientPipelineDeploy-${props.clientName}-${props.prodEnv.name}`, {
            env: {
                account: props.prodEnv.id,
                region: props.prodEnv.region,
            },
            clientName: props.clientName,
            environment: props.prodEnv,
            scriptRoleArn: buildRole.roleArn,
            clientSubdomain: `${props.client.subdomain}.dev${props.fabric == Fabrics.Staging ? '.staging' : ''}`,
        });

        buildRole.addToPrincipalPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "s3:GetBucket*",
                "s3:GetObject*",
                "s3:List*",
                "s3:PutObject*",
            ],
            resources: [prodDeploy.stack.bucket.bucketArn, `${prodDeploy.stack.bucket.bucketArn}/*`],
        }));

        // pipeline

        const pipeline = new CodePipeline(this, `ClientPipeline-${props.clientName}-${props.pipelineEnv.name}`, {
            pipelineName: `ClientPipelineStack-${props.clientName}-${props.pipelineEnv.name}`,
            crossAccountKeys: true,
            synth: buildStep,
        });

        pipeline.addStage(devDeploy, {
            post: [
                new CodeBuildStep(`ClientPipelinePublish-${props.clientName}-${props.devEnv.name}`, {
                    commands: [
                        'ls -al',
                        'aws sts get-caller-identity',
                        `aws s3 sync . s3://${devDeploy.stack.bucket.bucketName}/website`,
                    ],
                    role: buildRole
                }),
            ],
        });

        pipeline.addStage(prodDeploy, {
            post: [
                new CodeBuildStep(`ClientPipelinePublish-${props.clientName}-${props.prodEnv.name}`, {
                    commands: [
                        'ls -al',
                        'aws sts get-caller-identity',
                        `aws s3 sync . s3://${prodDeploy.stack.bucket.bucketName}/website`,
                    ],
                    role: buildRole
                }),
            ],
        });

        pipeline.buildPipeline();

        props.cdkBucket.addToResourcePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new ArnPrincipal(buildRole.roleArn)],
            actions: [
                "s3:GetBucket*",
                "s3:GetObject*",
                "s3:List*",
            ],
            resources: [props.cdkBucket.bucketArn, `${props.cdkBucket.bucketArn}/*`],
        }));
    }
}