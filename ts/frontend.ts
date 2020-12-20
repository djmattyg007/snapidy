interface Window {
    snapidyStore: any;
    snapidyApp: any;
}

function getEl(elId: string) {
    return document.getElementById(elId)!;
}

(function() {
    interface SnapidyHostPreparer {
        readonly host: SnapserverHost;
        readonly clients: Array<SnapidyClient>;
    }

    interface SnapidyStoreState {
        groups: ReadonlyArray<SnapidyGroup>,
        hosts: ReadonlyArray<SnapidyHost>,
        server: SnapserverServer | null;
        streams: ReadonlyArray<SnapserverStream>;
    }

    interface SnapidyStoreContext {
        state: SnapidyStoreState;
        commit: (mutation: string, payload: any) => void;
    }

    let snapcontrol: SnapControl;

    const store = Vuex.createStore({
        state(): SnapidyStoreState {
            return {
                groups: [],
                hosts: [],
                server: null,
                streams: [],
            };
        },
        actions: {
            onStatusUpdate(context: SnapidyStoreContext, status: SnapserverStatus) {
                const groups: SnapidyGroup[] = [];
                const hosts: { [name: string]: SnapidyHostPreparer } = {};
                for (const group of status.groups) {
                    groups.push({
                        id: group.id,
                        streamId: group.stream_id,
                        muted: group.muted,
                    });

                    for (const client of group.clients) {
                        if (!client.connected) {
                            continue;
                        }

                        const hostname = client.host.name;
                        if (hosts[hostname] === undefined) {
                            hosts[hostname] = {
                                host: client.host,
                                clients: [],
                            };
                        }

                        hosts[hostname].clients.push({
                            id: client.id,
                            streamId: group.stream_id,
                            muted: client.config.volume.muted,
                            volumePercent: client.config.volume.percent,

                            latency: client.config.latency,
                            lastSeen: client.lastSeen,
                            snapclient: client.snapclient,
                        });
                    }
                }

                context.commit("groupsUpdate", groups);
                context.commit("hostsUpdate", Object.values(hosts).filter((host) => host.clients.length > 0));
                context.commit("serverUpdate", status.server);
                context.commit("streamsUpdate", status.streams);
            },
        },
        mutations: {
            groupsUpdate(state: SnapidyStoreState, groups: ReadonlyArray<SnapidyGroup>) {
                state.groups = groups;
            },
            hostsUpdate(state: SnapidyStoreState, hosts: ReadonlyArray<SnapidyHost>) {
                state.hosts = hosts;
            },
            serverUpdate(state: SnapidyStoreState, server: SnapserverServer) {
                state.server = server;
            },
            streamsUpdate(state: SnapidyStoreState, streams: ReadonlyArray<SnapserverStream>) {
                state.streams = streams;
            },
        },
    });

    const hostTemplateHtml = getEl("host-template").innerHTML;
    const appTemplateHtml = getEl("app-template").innerHTML;

    interface SnapidyComponent {
        $store: typeof store;
    }

    const appComponent = {
        name: "App",
        template: appTemplateHtml,
        computed: {
            hosts(this: SnapidyComponent): SnapidyHost[] {
                return this.$store.state.hosts;
            },
            server(this: SnapidyComponent): SnapserverServer | null {
                return this.$store.state.server;
            },
        },
    };
    const app = Vue.createApp(appComponent);

    app.use(store);

    interface SnapidyHostComponent extends SnapidyComponent {
        readonly host: SnapidyHost;
        internalVolume: number;
        internalMuted: boolean;
        debouncedVolumeUpdate: () => void;
        volumePercent: number;
        muted: boolean;
    }
    app.component("SnapidyHost", {
        name: "SnapidyHost",
        template: hostTemplateHtml,
        props: {
            host: Object,
        },
        data(this: SnapidyHostComponent) {
            let totalVolume = 0;
            let avgVolume: number;
            if (this.host.clients.length > 0) {
                for (const client of this.host.clients) {
                    totalVolume += client.volumePercent;
                }
                avgVolume = totalVolume / this.host.clients.length;
            } else {
                avgVolume = 100;
            }

            return {
                internalVolume: avgVolume,
                internalMuted: false,

                debouncedVolumeUpdate: debounce(() => {
                    const volumePercent = this.volumePercent;
                    const muted = this.muted;
                    for (const client of this.host.clients) {
                        snapcontrol.setClientVolume(client.id, volumePercent, muted);
                    }
                }, 100),
            };
        },
        computed: {
            volumePercent: {
                get(this: SnapidyHostComponent): number {
                    return this.internalVolume;
                },
                set(this: SnapidyHostComponent, newVolume: number): void {
                    this.internalVolume = newVolume;
                    this.debouncedVolumeUpdate();
                },
            },
            muted: {
                get(this: SnapidyHostComponent): boolean {
                    return this.internalMuted;
                },
                set(this: SnapidyHostComponent, newMuted: boolean): void {
                    this.internalMuted = newMuted;
                    this.debouncedVolumeUpdate();
                },
            },
        },
        methods: {
            muteHost(this: SnapidyHostComponent): void {
                this.muted = true;
            },
            unmuteHost(this: SnapidyHostComponent): void {
                this.muted = false;
            },
            showHostDetails(this: SnapidyHostComponent): void {
                const msg = `IP: ${this.host.host.ip}\n` +
                    `MAC: ${this.host.host.mac}\n` +
                    `Arch: ${this.host.host.arch}\n` +
                    `OS: ${this.host.host.os}\n`;
                alert(msg);
            },
            showClientDetails(this: SnapidyHostComponent, client: SnapidyClient): void {
                const msg = `Latency: ${client.latency}\n` +
                    `Version: ${client.snapclient.version}\n` +
                    `Protocol version: ${client.snapclient.protocolVersion}\n`;
                alert(msg);
            },
        },
    });

    const start = async () => {
        interface AppSettings extends SnapControlSettings {
            readonly wsUrl: string;
        }

        const configResponse = await fetch("config.json");
        const appConfig: AppSettings = await configResponse.json();
        const { wsUrl, ...snapcontrolSettings } = appConfig;

        snapcontrol = new SnapControl(
            wsUrl,
            (status: SnapserverStatus) => store.dispatch("onStatusUpdate", status),
            snapcontrolSettings,
        );

        app.mount("#app");

        window.snapidyStore = store;
        window.snapidyApp = app;
    };
    start();
})();
