export enum Fabrics {
    Staging,
    Live
}

export interface ClientInfo {
    author: string;
    package: string;
    branch: string;
    subdomain: string;
    root?: string;
    fabrics: Fabrics[];
}

export interface ClientsInfo {
    [clientName: string]: ClientInfo;
}

export const Clients: ClientsInfo = {
    'TestWTrouble': {
        author: 'akalman',
        package: 'wtrouble-test',
        branch: 'main',
        subdomain: 'test-wtrouble',
        fabrics: [Fabrics.Staging, Fabrics.Live]
    },
    'TestGameTracker': {
        author: 'akalman',
        package: 'gaming_website_test',
        branch: 'main',
        subdomain: 'test-game-tracker',
        fabrics: [Fabrics.Staging]
    },
};
