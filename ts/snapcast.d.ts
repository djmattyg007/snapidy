interface SnapserverLastSeen {
    readonly sec: number;
    readonly usec: number;
}

interface SnapserverSnapclient {
    readonly name: string;
    readonly protocolVersion: number;
    readonly version: string;
}

interface SnapserverSnapserver {
    readonly controlProtocolVersion: number;
    readonly name: string;
    readonly protocolVersion: number;
    readonly version: string;
}

interface SnapserverHost {
    readonly arch: string;
    readonly ip: string;
    readonly mac: string;
    readonly name: string;
    readonly os: string;
}

interface SnapserverClientVolume {
    readonly muted: boolean;
    readonly percent: number;
}

interface SnapserverClientConfig {
    readonly instance: number;
    readonly latency: number;
    readonly name: string;
    readonly volume: SnapserverClientVolume;
}

interface SnapserverClient {
    readonly config: SnapserverClientConfig;
    readonly connected: boolean;
    readonly host: SnapserverHost;
    readonly id: string;
    readonly lastSeen: SnapserverLastSeen;
    readonly snapclient: SnapserverSnapclient;
}

interface SnapserverGroup {
    readonly clients: ReadonlyArray<SnapserverClient>;
    readonly id: string;
    readonly muted: boolean;
    readonly name: string;
    readonly stream_id: string;
}

interface SnapserverServer {
    readonly host: SnapserverHost;
    readonly snapserver: SnapserverSnapserver;
}

interface SnapserverStreamUri {
    readonly fragment: string;
    readonly host: string;
    readonly path: string;
    readonly query: { [key: string]: string };
    readonly raw: string;
    readonly scheme: string;
}

interface SnapserverStream {
    readonly id: string;
    readonly meta: {
        readonly STREAM: string;
    };
    readonly status: "playing" | "idle";
    readonly uri: SnapserverStreamUri;
}

interface SnapserverStatus {
    readonly groups: ReadonlyArray<SnapserverGroup>;
    readonly server: SnapserverServer;
    readonly streams: ReadonlyArray<SnapserverStream>;
}
