import type { ChartMode, PanelSpec, TemplateId, ThemeName } from "@axicharts/charts-spec";
import type { ChartConfigSpec } from "@axicharts/charts-spec";

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
  mapResponse?: (payload: unknown) => Record<string, unknown>;
};

export type WebSocketDataSourceSpec = {
  id?: string;
  type: "websocket";
  url: string;
  staleAfterMs?: number;
  reconnectDelayMs?: number;
  WebSocketImpl?: typeof WebSocket;
  parseMessage?: (payload: unknown) => Record<string, unknown>;
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
  reconnectDelayMs?: number;
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

export type BoundDataSourceSpec = DataSourceSpec & { id: string };

export type AlarmSeverity = "normal" | "warning" | "alarm" | "critical";

export type AlarmItem = {
  id: string;
  message: string;
  severity?: AlarmSeverity;
  acknowledged?: boolean;
  shelved?: boolean;
  timestamp?: number;
  tag?: string;
  metric?: string;
  panelId?: string;
};

export type DataSourceSpec =
  | StaticDataSourceSpec
  | RestDataSourceSpec
  | WebSocketDataSourceSpec
  | MockLiveDataSourceSpec
  | MqttDataSourceSpec
  | HistorianDataSourceSpec;

export type DataSourceAdapterType = DataSourceSpec["type"];

export type AdapterFixtureHrefResolver = (
  adapterType: DataSourceAdapterType,
) => string | undefined;

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
  chartConfig?: ChartConfigSpec;
  dataSource?: DataSourceSpec;
  dataSources?: BoundDataSourceSpec[];
  dataSourceId?: string;
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
  dataSourceId?: string;
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
  dataSources?: BoundDataSourceSpec[];
  dataSourceId?: string;
  staleAfterMs?: number;
};

export type TabularPanelBlock = {
  questionId?: string;
  panel: PanelSpec;
  rows: Array<Record<string, string | number | boolean>>;
};

export type TabularPlanDecision = {
  step: string;
  api: string;
  intent?: string;
  status: string;
  notes: string;
};

export type PanelsDashboardSpec = {
  version?: string;
  title?: string;
  subtitle?: string;
  theme?: ThemeName;
  mode?: ChartMode;
  vertical?: string;
  /** Raw CSV for replan / follow-up chat */
  sourceCsv?: string;
  decisions?: TabularPlanDecision[];
  kpis: TabularPanelBlock[];
  charts: TabularPanelBlock[];
};

export type RuntimeDashboardSpec =
  | {
      layout?: "embed";
      dashboard: DashboardEmbedSpec;
    }
  | {
      layout: "mosaic";
      wall: MosaicWallSpec;
    }
  | {
      layout: "panels";
      panels: PanelsDashboardSpec;
    };
