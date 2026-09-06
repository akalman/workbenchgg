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
        region: 'us-west-2',
    },
    'AppDev': {
        name: 'AppDev',
        id: '957809771416',
        region: 'us-west-2',
    },
    'AppProd': {
        name: 'AppProd',
        id: '721903336580',
        region: 'us-west-2',
    },
    'ClientStagingDev': {
        name: 'ClientStagingDev',
        id: '450222979953',
        region: 'us-west-2',
    },
    'ClientStagingProd': {
        name: 'ClientStagingProd',
        id: '620694777998',
        region: 'us-west-2',
    },
    'ClientLiveDev': {
        name: 'ClientLiveDev',
        id: '561633118725',
        region: 'us-west-2',
    },
    'ClientLiveProd': {
        name: 'ClientLiveProd',
        id: '272973566406',
        region: 'us-west-2',
    },
};