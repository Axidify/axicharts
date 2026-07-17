export {
  buildPortableSpecJson,
  buildReactEmbedSnippet,
  buildInlineReactEmbedSnippet,
  buildEmbedBundle,
  validateRuntimeSpecJson,
  type EmbedBundle,
  type EmbedSnippetOptions,
} from "./embedSnippet";
export {
  parseDashboardExport,
  serializeDashboardExport,
  type DashboardExport,
} from "./workspace/export";
export { RUNTIME_VERSION } from "./types";
export type {
  AlarmItem,
  AlarmSeverity,
  BoundDataSourceSpec,
  ConnectionState,
  DashboardEmbedSpec,
  DataSourceSnapshot,
  DataSourceSpec,
  HistorianDataSourceSpec,
  MockLiveDataSourceSpec,
  MosaicCellSpec,
  MosaicWallSpec,
  MqttClientLike,
  MqttConnectFn,
  MqttDataSourceSpec,
  RestDataSourceSpec,
  RuntimeDashboardSpec,
  StaticDataSourceSpec,
  WebSocketDataSourceSpec,
} from "./types";

export { useAlarmState, type AlarmState, type UseAlarmStateOptions } from "./useAlarmState";
export {
  DEFAULT_ALARM_STATE_KEY,
  loadPersistedAlarmScope,
  savePersistedAlarmScope,
  type PersistedAlarmScope,
} from "./alarmStateStore";
export { AlarmBanner, type AlarmBannerProps } from "./AlarmBanner";
export { DashboardEmbed, type DashboardEmbedProps } from "./DashboardEmbed";
export { MosaicWall, type MosaicWallProps } from "./MosaicWall";
export { RuntimeDashboard, type RuntimeDashboardProps } from "./RuntimeDashboard";
export { RuntimeShell, type RuntimeShellProps } from "./RuntimeShell";
export { TemplatePicker, type TemplatePickerProps } from "./TemplatePicker";
export { useDataSource } from "./useDataSource";
export { useDataSources, resolveBoundSnapshot } from "./useDataSources";
export { aggregateSnapshots, EMPTY_SNAPSHOT } from "./aggregateSnapshots";
export { connectSource } from "./connectSource";
export { mergeMosaicData, pluckMosaicData } from "./mosaicData";
export { readAlarms } from "./readAlarms";
export {
  addDashboard,
  addWorkspace,
  createDefaultDashboard,
  createDefaultWorkspaceStore,
  deleteDashboard,
  getActiveDashboard,
  getActiveWorkspace,
  loadWorkspaceStore,
  parseDashboardSpec,
  persistWorkspaceStore,
  renameDashboard,
  saveDashboardSpec,
  selectDashboard,
  selectWorkspace,
} from "./workspace/store";
export {
  DEFAULT_WORKSPACE_STORE_KEY,
  LEGACY_RUNTIME_SPEC_KEY,
  type SavedDashboard,
  type Workspace,
  type WorkspaceStore,
} from "./workspace/types";
export {
  parseRuntimeSpec,
  serializeRuntimeSpec,
  toPortableRuntimeSpec,
} from "./runtimeSpec";

export {
  buildHistorianUrl,
  connectHistorianSource,
  defaultHistorianMapper,
} from "./adapters/historian";
export { connectMockLiveSource } from "./adapters/mockLive";
export { connectMqttSource } from "./adapters/mqtt";
export { connectRestSource } from "./adapters/rest";
export { connectStaticSource } from "./adapters/static";
export { connectWebSocketSource } from "./adapters/websocket";
