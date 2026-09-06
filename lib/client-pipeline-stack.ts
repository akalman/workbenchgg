import { Stack, StackProps, Stage } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { ClientInfo } from '../config/clients';
import { EnvironmentInfo } from '../config/environments';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { join } from 'path';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { S3DeployStage } from './s3-deploy-stage';

export interface ClientStackProps extends StackProps {
    clientName: string;
    client: ClientInfo;
    pipelineEnv: EnvironmentInfo;
    devEnv: EnvironmentInfo;
    prodEnv: EnvironmentInfo;
    connection: string;
    cdkBucket: IBucket;
}

export class ClientPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props: ClientStackProps) {
        super(scope, id, props);

        const buildStep = new ShellStep(`ClientPipelineBuild-${props.clientName}-${props.pipelineEnv.name}`, {
            input: CodePipelineSource.connection(`${props.client.author}/${props.client.package}`, props.client.branch, {
                actionName: `${props.clientName}-source`,
                connectionArn: props.connection,
            }),
            commands: [ 'ls -al', 'aws sts get-caller-identity', `aws s3 cp s3://${props.cdkBucket.bucketName}/workbenchgg/ ./cdk.out/ --recursive`, 'ls -al', 'echo "Done."' ],
            // primaryOutputDirectory: '.',
        });

        const devDeploy = new S3DeployStage(this, `ClientPipelineDeploy-${props.clientName}-${props.devEnv.name}`, {
            env: {
                account: props.devEnv.id,
                region: props.devEnv.region,
            },
            clientName: props.clientName,
            environment: props.devEnv,
            scriptRoleArn: "arn:aws:sts::957809771416:assumed-role/WorkbenchggApplication-De-ClientPipelineTestWTroubl-PllNPlrX7SpY",
        });

        const pipeline = new CodePipeline(this, `ClientPipeline-${props.clientName}-${props.pipelineEnv.name}`, {
            pipelineName: `ClientPipelineStack-${props.clientName}-${props.pipelineEnv.name}`,
            crossAccountKeys: true,
            // selfMutation: false,
            synth: buildStep,
            codeBuildDefaults: {
                rolePolicy: [
                    new PolicyStatement({
                        effect: Effect.ALLOW,
                        actions: [
                            "s3:GetBucket*",
                            "s3:GetObject*",
                            "s3:List*",
                        ],
                        resources: [props.cdkBucket.bucketArn, `${props.cdkBucket.bucketArn}/*`],
                    }),
                    new PolicyStatement({
                        effect: Effect.ALLOW,
                        actions: [
                            "s3:PutObject*",
                            "s3:List*",
                        ],
                        resources: [devDeploy.stack.bucket.bucketArn, `${devDeploy.stack.bucket.bucketArn}/*`],
                    }),
                ],
            },
        });

        pipeline.addStage(devDeploy, {
            post: [
                new ShellStep(`ClientPipelinePublish-${props.clientName}-${props.pipelineEnv.name}`, {
                    commands: [
                        'ls -al',
                        'aws sts get-caller-identity',
                        `aws s3 sync . s3://${devDeploy.stack.bucket.bucketName}/website`,
                    ]
                }),
            ],
        });

        pipeline.buildPipeline();

        props.cdkBucket.addToResourcePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [ new ArnPrincipal("arn:aws:iam::957809771416:role/WorkbenchggApplication-De-ClientPipelineTestWTroubl-HfXxXeGr487L") ],
            actions: [
                "s3:GetBucket*",
                "s3:GetObject*",
                "s3:List*",
            ],
            resources: [props.cdkBucket.bucketArn, `${props.cdkBucket.bucketArn}/*`],
        }));
    }
}