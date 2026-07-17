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

export type DataSourceSpec =
  | StaticDataSourceSpec
  | RestDataSourceSpec
  | WebSocketDataSourceSpec
  | MockLiveDataSourceSpec;

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
