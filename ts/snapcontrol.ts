interface SnapControlSettings {
    readonly reconnectTimeout: number;
    readonly statusThrottle: number;
}

type SnapserverStatusObserver = (status: SnapserverStatus) => void;

const defaultSettings: SnapControlSettings = {
    reconnectTimeout: 2000,
    statusThrottle: 250,
};

class SnapControl {
    public readonly wsUrl: string;
    private readonly observer: SnapserverStatusObserver;
    public readonly settings: SnapControlSettings;

    private conn!: WebSocket;
    private readonly debouncedRequestStatus: () => void;

    private reqId: number = 0;
    private statusReqId: number = -1;

    public constructor(wsUrl: string, observer: SnapserverStatusObserver, settings?: Partial<SnapControlSettings>) {
        this.wsUrl = wsUrl;
        this.observer = observer;

        this.settings = Object.assign({}, defaultSettings, settings || {});

        this.connect();

        this.debouncedRequestStatus = debounce(this.requestStatusUpdate.bind(this), this.settings.statusThrottle);
    }

    private connect(): void {
        this.conn = new WebSocket(this.wsUrl);
        this.conn.onmessage = (msg: MessageEvent) => this.onMessage(msg.data);
        this.conn.onopen = () => this.requestStatusUpdate();
        this.conn.onerror = (ev: Event) => {
            console.error("Websocket error occurred");
            console.error(ev);
        };
        this.conn.onclose = () => {
            console.info(`Websocket connection lost, reconnecting in ${this.settings.reconnectTimeout}ms`);
            setTimeout(() => this.connect(), this.settings.reconnectTimeout);
        };
    }

    public requestStatusUpdate(): void {
        const newReqId = ++this.reqId;
        const msg = {
            id: newReqId,
            jsonrpc: "2.0",
            method: "Server.GetStatus",
        };

        const msgJson = JSON.stringify(msg);
        this.conn.send(msgJson);
        this.statusReqId = newReqId;
    }

    public setClientVolume(clientId: string, percent: number, muted: boolean): void {
        percent = Math.max(0, Math.min(100, percent));

        const params = {
            id: clientId,
            volume: { percent, muted },
        };
        this.sendRequest("Client.SetVolume", params);
    }

    private sendRequest(method: string, params: { [key: string]: any }): void {
        const msg = {
            id: ++this.reqId,
            jsonrpc: "2.0",
            method,
            params,
        };

        const msgJson = JSON.stringify(msg);
        this.conn.send(msgJson);
    }

    private onMessage(msg: string): void {
        const answer = JSON.parse(msg);

        const isStatusResponse = answer.id === this.statusReqId;
        if (isStatusResponse && answer.result.server) {
            this.emitServerStatus(answer.result.server);
            return;
        }

        // If it's not a response, it's a notification. In this case we don't care what
        // the notification is, we're just going to re-request server status in full.
        // Consumers will know more about how to process the data. It's much easier to
        // give them something consistent and repeatable to work with.
        this.debouncedRequestStatus();
    }

    private emitServerStatus(status: SnapserverStatus): void {
        this.observer(status);
    }
}
