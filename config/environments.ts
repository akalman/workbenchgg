export interface EnvironmentsInfo {
    Root: EnvironmentInfo;
    AppDev: EnvironmentInfo;
    AppProd: EnvironmentInfo;
    ClientSandboxDev: EnvironmentInfo;
    ClientSandboxProd: EnvironmentInfo;
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
    'ClientSandboxDev': {
        name: 'ClientSandboxDev',
        id: '265308423083',
        region: 'us-west-2',
    },
    'ClientSandboxProd': {
        name: 'ClientSandboxProd',
        id: '398036158572',
        region: 'us-west-2',
    },
    'ClientLiveDev': {
        name: 'ClientLiveDev',
        id: '',
        region: 'us-west-2',
    },
    'ClientLiveProd': {
        name: 'ClientLiveProd',
        id: '',
        region: 'us-west-2',
    },
};