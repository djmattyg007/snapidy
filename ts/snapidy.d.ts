interface SnapidyClient {
    readonly id: string;
    readonly streamId: string;
    muted: boolean;
    volumePercent: number;

    latency: number;
    lastSeen: SnapserverLastSeen;
    snapclient: SnapserverSnapclient;
}

interface SnapidyHost {
    readonly host: SnapserverHost;
    readonly clients: ReadonlyArray<SnapidyClient>;
}

interface SnapidyGroup {
    readonly id: string;
    readonly streamId: string;
    muted: boolean;
}
