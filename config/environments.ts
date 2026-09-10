export interface EnvironmentsInfo {
    Root: RootEnvironmentInfo;
    AppDev: ClientPipelineEnvironmentInfo;
    AppProd: ClientPipelineEnvironmentInfo;
    ClientStagingDev: EnvironmentInfo;
    ClientStagingProd: EnvironmentInfo;
    ClientLiveDev: EnvironmentInfo;
    ClientLiveProd: EnvironmentInfo;
}

export interface EnvironmentInfo {
    id: string;
    region: string;
    name: string;
}

export interface RootEnvironmentInfo extends EnvironmentInfo {
    connectionArn: string;
    hostedZoneEditorRole: string;
}

export interface ClientPipelineEnvironmentInfo extends EnvironmentInfo {
    connectionArn: string;
}

export const Environments: EnvironmentsInfo = {
    'Root': {
        name: 'Root',
        id: '256157865211',
        region: 'us-east-1',
        connectionArn: 'arn:aws:codeconnections:us-west-2:256157865211:connection/35e9901e-9116-43ef-be60-fe4640cabe78',
        hostedZoneEditorRole: 'arn:aws:iam::256157865211:role/WorkbenchggHostedZoneEditorRole',
    },
    'AppDev': {
        name: 'AppDev',
        id: '957809771416',
        region: 'us-east-1',
        connectionArn: 'arn:aws:codeconnections:us-west-2:957809771416:connection/87aa428e-a188-4c37-b014-b45d70da9425',
    },
    'AppProd': {
        name: 'AppProd',
        id: '721903336580',
        region: 'us-east-1',
        connectionArn: 'arn:aws:codeconnections:us-east-1:721903336580:connection/ac6774c5-f138-4d02-90f0-1df7180e390f',
    },
    'ClientStagingDev': {
        name: 'ClientStagingDev',
        id: '450222979953',
        region: 'us-east-1',

    },
    'ClientStagingProd': {
        name: 'ClientStagingProd',
        id: '620694777998',
        region: 'us-east-1',
    },
    'ClientLiveDev': {
        name: 'ClientLiveDev',
        id: '561633118725',
        region: 'us-east-1',
    },
    'ClientLiveProd': {
        name: 'ClientLiveProd',
        id: '272973566406',
        region: 'us-east-1',
    },
};