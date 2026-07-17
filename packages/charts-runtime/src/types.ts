import type { ChartMode, TemplateId, ThemeName } from "@axicharts/charts-spec";

export const RUNTIME_VERSION = "0.1";

export type ConnectionState = "idle" | "connecting" | "ready" | "stale" | "error";

export type StaticDataSourceSpec = {
  id?: string;
  type: "static";
  data: Record<string, unknown>;
};

export type RestDataSourceSpec = {
  id?: string;
  type: "rest";
  url: string;
  intervalMs?: number;
  staleAfterMs?: number;
  fetch?: typeof fetch;
};

export type WebSocketDataSourceSpec = {
  id?: string;
  type: "websocket";
  url: string;
  staleAfterMs?: number;
  WebSocketImpl?: typeof WebSocket;
};

export type MockLiveDataSourceSpec = {
  id?: string;
  type: "mock-live";
  data: Record<string, unknown>;
  intervalMs?: number;
  mutate?: (data: Record<string, unknown>) => Record<string, unknown>;
};

export type MqttClientLike = {
  on(event: string, listener: (...args: unknown[]) => void): void;
  subscribe(topic: string, options?: unknown): void;
  end(force?: boolean): void;
};

export type MqttConnectFn = (
  url: string,
  options?: { clientId?: string },
) => MqttClientLike;

export type MqttDataSourceSpec = {
  id?: string;
  type: "mqtt";
  url: string;
  topic: string;
  staleAfterMs?: number;
  clientId?: string;
  connect?: MqttConnectFn;
  parsePayload?: (raw: unknown) => Record<string, unknown>;
};

export type HistorianDataSourceSpec = {
  id?: string;
  type: "historian";
  url: string;
  tags?: string[];
  windowMs?: number;
  intervalMs?: number;
  staleAfterMs?: number;
  fetch?: typeof fetch;
  mapResponse?: (payload: unknown) => Record<string, unknown>;
};

export type DataSourceSpec =
  | StaticDataSourceSpec
  | RestDataSourceSpec
  | WebSocketDataSourceSpec
  | MockLiveDataSourceSpec
  | MqttDataSourceSpec
  | HistorianDataSourceSpec;

export type DataSourceSnapshot = {
  data: Record<string, unknown>;
  connection: ConnectionState;
  lastUpdatedAt?: number;
  error?: string;
};

export type DashboardEmbedSpec = {
  version?: string;
  title?: string;
  subtitle?: string;
  theme?: ThemeName;
  mode?: ChartMode;
  template: TemplateId;
  data?: Record<string, unknown>;
  dataSource?: DataSourceSpec;
  staleAfterMs?: number;
};

export type MosaicCellSpec = {
  id: string;
  template: TemplateId;
  title?: string;
  subtitle?: string;
  theme?: ThemeName;
  mode?: ChartMode;
  data?: Record<string, unknown>;
  dataPath?: string;
  colSpan?: number;
  rowSpan?: number;
};

export type MosaicWallSpec = {
  version?: string;
  title?: string;
  subtitle?: string;
  theme?: ThemeName;
  mode?: ChartMode;
  columns?: number;
  gap?: number;
  cells: MosaicCellSpec[];
  data?: Record<string, unknown>;
  dataSource?: DataSourceSpec;
  staleAfterMs?: number;
};

export type RuntimeDashboardSpec =
  | {
      layout?: "embed";
      dashboard: DashboardEmbedSpec;
    }
  | {
      layout: "mosaic";
      wall: MosaicWallSpec;
    };
