export { RUNTIME_VERSION } from "./types";
export type {
  ConnectionState,
  DashboardEmbedSpec,
  DataSourceSnapshot,
  DataSourceSpec,
  MockLiveDataSourceSpec,
  RestDataSourceSpec,
  StaticDataSourceSpec,
  WebSocketDataSourceSpec,
} from "./types";

export { DashboardEmbed, type DashboardEmbedProps } from "./DashboardEmbed";
export { RuntimeShell, type RuntimeShellProps } from "./RuntimeShell";
export { useDataSource } from "./useDataSource";

export { connectMockLiveSource } from "./adapters/mockLive";
export { connectRestSource } from "./adapters/rest";
export { connectStaticSource } from "./adapters/static";
export { connectWebSocketSource } from "./adapters/websocket";
