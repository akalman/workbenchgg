export interface EnvironmentsInfo {
    Root: EnvironmentInfo;
    AppDev: EnvironmentInfo;
    AppProd: EnvironmentInfo;
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

export const Environments: EnvironmentsInfo = {
    'Root': {
        name: 'Root',
        id: '256157865211',
        region: 'us-east-1',
    },
    'AppDev': {
        name: 'AppDev',
        id: '957809771416',
        region: 'us-east-1',
    },
    'AppProd': {
        name: 'AppProd',
        id: '721903336580',
        region: 'us-east-1',
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