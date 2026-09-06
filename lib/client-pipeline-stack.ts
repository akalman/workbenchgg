import { Stack, StackProps, Stage } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { ClientInfo } from '../config/clients';
import { EnvironmentInfo } from '../config/environments';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { join } from 'path';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

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
            commands: [ 'ls -al', 'aws sts get-caller-identity', `aws s3 cp s3://${props.cdkBucket.bucketName}/workbenchgg/ ./cdk-out/`, 'ls -al', 'echo "Done."' ],
            primaryOutputDirectory: '.',
        });

        const pipeline = new CodePipeline(this, `ClientPipeline-${props.clientName}-${props.pipelineEnv.name}`, {
            pipelineName: `ClientPipelineStack-${props.clientName}-${props.pipelineEnv.name}`,
            crossAccountKeys: true,
            selfMutation: false,
            synth: buildStep,
            codeBuildDefaults: {
                rolePolicy: [
                    new PolicyStatement({
                        effect: Effect.ALLOW,
                        actions: [
                            "s3:GetBucket*",
                            "s3:GetObject*",
                            "s3:List*",
                            "s3:HeadObject",
                        ],
                        resources: [props.cdkBucket.bucketArn, `${props.cdkBucket.bucketArn}/*`],
                    }),
                ],
            },
        });

        const stage = new Stage(this, `ClientPipelineStage-${props.clientName}-${props.pipelineEnv.name}`, {
            // env: {
            //     account: props.devEnv.id,
            //     region: props.devEnv.region,
            // },
            env: props.env,
        });
        const stack = new Stack(stage, `ClientPipelineStack-${props.clientName}-${props.pipelineEnv.name}`);
        const bucket = new Bucket(stack, `ClientPipelineBucket-${props.clientName}-${props.pipelineEnv.name}`, {
            bucketName: `ClientPipelineBucket-${props.clientName}-${props.pipelineEnv.name}`.toLocaleLowerCase(),
        });
        const deployment = new BucketDeployment(stack, `ClientPipelineDeploy-${props.clientName}-${props.pipelineEnv.name}`, {
            sources: [ Source.asset(join(__dirname, '.')) ],
            destinationBucket: bucket,
        });

        pipeline.addStage(stage);

        pipeline.buildPipeline();

        props.cdkBucket.addToResourcePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [ new ArnPrincipal("arn:aws:iam::957809771416:role/WorkbenchggApplication-De-ClientPipelineTestWTroubl-HfXxXeGr487L") ],
            actions: [
                "s3:GetBucket*",
                "s3:GetObject*",
                "s3:List*",
                "s3:HeadObject",
            ],
            resources: [props.cdkBucket.bucketArn, `${props.cdkBucket.bucketArn}/*`],
        }));
    }
}