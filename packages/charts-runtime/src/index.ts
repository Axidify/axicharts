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
  parseShareExport,
  serializeDashboardExport,
  serializeWorkspaceExport,
  validateShareExportJson,
  type DashboardExport,
  type SerializeExportOptions,
  type ShareExport,
  type ShareValidationResult,
  type WorkspaceShareExport,
} from "./workspace/export";
export { RUNTIME_VERSION } from "./types";
export type {
  AlarmItem,
  AlarmSeverity,
  AdapterFixtureHrefResolver,
  BoundDataSourceSpec,
  ConnectionState,
  DashboardEmbedSpec,
  DataSourceAdapterType,
  DataSourceSnapshot,
  DataSourceSpec,
  HistorianDataSourceSpec,
  MockLiveDataSourceSpec,
  MosaicCellSpec,
  MosaicWallSpec,
  PanelsDashboardSpec,
  TabularPanelBlock,
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
export { ConnectionBadge, type ConnectionBadgeProps } from "./ConnectionBadge";
export { AdapterHealthStrip, type AdapterHealthItem, type AdapterHealthStripProps } from "./AdapterHealthStrip";
export { DashboardEmbed, type DashboardEmbedProps } from "./DashboardEmbed";
export { MosaicWall, type MosaicWallProps } from "./MosaicWall";
export { RuntimeDashboard, type RuntimeDashboardProps } from "./RuntimeDashboard";
export { PanelsDashboard, type PanelsDashboardProps } from "./PanelsDashboard";
export { inferPresentationDeck, resolvePresentationDeck } from "./presentationDeck/infer";
export type {
  PresentationDeckSlideSection,
  PresentationDeckSlideSpec,
  PresentationDeckSpec,
} from "./presentationDeck/types";
export { RuntimeShell, type RuntimeShellProps } from "./RuntimeShell";
export { TemplatePicker, type TemplatePickerProps } from "./TemplatePicker";
export { useDataSource } from "./useDataSource";
export { useDataSources, resolveBoundSnapshot } from "./useDataSources";
export { aggregateSnapshots, EMPTY_SNAPSHOT } from "./aggregateSnapshots";
export { isLiveDataSource } from "./isLiveDataSource";
export { mergeMosaicData, pluckMosaicData } from "./mosaicData";
export {
  listMosaicPresets,
  type MosaicPresetId,
  type MosaicPresetMeta,
} from "./mosaicPresetMeta";
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
  renameWorkspace,
  saveDashboardSpec,
  selectDashboard,
  selectWorkspace,
  importSharedWorkspace,
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
  type SerializeRuntimeSpecOptions,
} from "./runtimeSpec";
export {
  RUNTIME_SPEC_SCHEMA_URL,
  SHARE_EXPORT_SCHEMA_URL,
} from "./schemaUrls";
export {
  assertRuntimeSpec,
  formatValidationErrors,
  validateRuntimeSpecJson as validateRuntimeSpecDeep,
  validateRuntimeSpecRaw,
  type RuntimeValidationIssue,
  type RuntimeValidationResult,
} from "./runtimeValidation";

export {
  buildHistorianUrl,
  connectHistorianSource,
  defaultHistorianMapper,
} from "./adapters/historian";
export { connectMockLiveSource } from "./adapters/mockLive";
export { connectMqttSource } from "./adapters/mqtt";
export { connectRestSource } from "./adapters/rest";
export { defaultRestMapper, mergeAdapterExtras } from "./adapters/normalize";
export { connectStaticSource } from "./adapters/static";
export { connectWebSocketSource } from "./adapters/websocket";
