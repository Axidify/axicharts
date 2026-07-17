export const RUNTIME_SPEC_SCHEMA_URL =
  "https://axidify.github.io/axicharts/schema/runtime-spec.schema.json";

export const SHARE_EXPORT_SCHEMA_URL =
  "https://axidify.github.io/axicharts/schema/share-export.schema.json";

export const HOSTED_EXAMPLES_BASE_URL =
  "https://axidify.github.io/axicharts/examples/";

export type ImportPresetKind = "runtime" | "dashboard" | "workspace";

export type ImportPresetAdapter =
  | "static"
  | "rest"
  | "websocket"
  | "historian"
  | "mqtt"
  | "mock-live"
  | "mosaic";

export type HostedImportPreset = {
  id: string;
  label: string;
  filename: string;
  kind: ImportPresetKind;
  adapter?: ImportPresetAdapter;
};

export const HOSTED_IMPORT_PRESETS: HostedImportPreset[] = [
  { id: "ops-embed", label: "Ops embed", filename: "ops-embed.runtime.json", kind: "runtime", adapter: "static" },
  { id: "ops-mosaic", label: "Ops mosaic", filename: "ops-mosaic.runtime.json", kind: "runtime", adapter: "mosaic" },
  {
    id: "ops-historian",
    label: "Historian embed",
    filename: "ops-historian.runtime.json",
    kind: "runtime",
    adapter: "historian",
  },
  {
    id: "ops-mqtt",
    label: "MQTT embed",
    filename: "ops-mqtt.runtime.json",
    kind: "runtime",
    adapter: "mqtt",
  },
  {
    id: "ops-dashboard",
    label: "Dashboard share",
    filename: "ops-dashboard.share.json",
    kind: "dashboard",
  },
  {
    id: "ops-workspace",
    label: "Workspace bundle",
    filename: "ops-workspace.workspace.json",
    kind: "workspace",
  },
];

export const ADAPTER_FIXTURE_PRESETS: Record<"historian" | "mqtt", string> = {
  historian: "ops-historian",
  mqtt: "ops-mqtt",
};

export const SHARE_EXPORT_REFERENCE_PRESET: Record<"dashboard" | "workspace", string> = {
  dashboard: "ops-dashboard",
  workspace: "ops-workspace",
};

export const RUNTIME_EMBED_REFERENCE_PRESET: Record<"embed" | "mosaic", string> = {
  embed: "ops-embed",
  mosaic: "ops-mosaic",
};

export function isShareImportPreset(preset: HostedImportPreset): boolean {
  return preset.kind === "dashboard" || preset.kind === "workspace";
}

export function shareExportReferencePreset(
  tab: "dashboard" | "workspace",
): HostedImportPreset | undefined {
  return findImportPreset(SHARE_EXPORT_REFERENCE_PRESET[tab]);
}

export function runtimeEmbedReferencePreset(
  layout: "embed" | "mosaic",
): HostedImportPreset | undefined {
  return findImportPreset(RUNTIME_EMBED_REFERENCE_PRESET[layout]);
}

export function formatValidatePresetCommand(
  presetId: string,
  layer: "semantic" | "schema" | "all" = "all",
): string {
  const preset = findImportPreset(presetId);
  if (!preset) return `charts-runtime validate --preset ${presetId}`;
  const layerFlag = layer === "all" ? " --all" : layer === "schema" ? " --schema" : "";
  const shareFlag = isShareImportPreset(preset) ? " --share" : "";
  return `charts-runtime validate${shareFlag}${layerFlag} --preset ${presetId}`;
}

export function formatValidateFileCommand(
  filePath: string,
  shape: "share" | "runtime",
  layer: "semantic" | "schema" | "all" = "all",
): string {
  const layerFlag = layer === "all" ? " --all" : layer === "schema" ? " --schema" : "";
  const shareFlag = shape === "share" ? " --share" : "";
  const quoted = filePath.includes(" ") ? `"${filePath}"` : filePath;
  return `charts-runtime validate${shareFlag}${layerFlag} ${quoted}`;
}

export function hostedImportPresetUrl(preset: HostedImportPreset): string {
  return `${HOSTED_EXAMPLES_BASE_URL}${preset.filename}`;
}

export function localImportPresetUrl(preset: HostedImportPreset, baseUrl: string): string {
  const normalized = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${normalized}${preset.filename}`;
}

export function findImportPreset(id: string): HostedImportPreset | undefined {
  return HOSTED_IMPORT_PRESETS.find((preset) => preset.id === id);
}

export function parseImportPresetQuery(search: string): string | null {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  return params.get("preset") ?? params.get("import");
}

export const DOCS_SITE_ORIGIN = "https://axidify.github.io/axicharts";

export function importGalleryDeepLink(presetId: string, basePath = "/runtime/import"): string {
  return `${basePath}?preset=${encodeURIComponent(presetId)}`;
}

export function docsImportGalleryDeepLink(
  presetId: string,
  origin = DOCS_SITE_ORIGIN,
): string {
  const base = origin.endsWith("/") ? origin.slice(0, -1) : origin;
  return `${base}/runtime/import?preset=${encodeURIComponent(presetId)}`;
}

export function dashboarderImportDeepLink(
  presetId: string,
  origin = "http://localhost:3000",
): string {
  const base = origin.endsWith("/") ? origin.slice(0, -1) : origin;
  return `${base}/?import=${encodeURIComponent(presetId)}`;
}

export type ImportDeepLinkEntry = {
  preset: HostedImportPreset;
  galleryPath: string;
  dashboarderUrl: string;
  hostedUrl: string;
  localMirrorPath: string;
};

export function listImportDeepLinks(docsBase = "/"): ImportDeepLinkEntry[] {
  const examplesBase = docsBase.endsWith("/") ? `${docsBase}examples/` : `${docsBase}/examples/`;
  return HOSTED_IMPORT_PRESETS.map((preset) => ({
    preset,
    galleryPath: importGalleryDeepLink(preset.id),
    dashboarderUrl: dashboarderImportDeepLink(preset.id),
    hostedUrl: hostedImportPresetUrl(preset),
    localMirrorPath: localImportPresetUrl(preset, examplesBase),
  }));
}

export type WithSchemaHint<T extends Record<string, unknown>> = T & {
  $schema: string;
};

export function withSchemaHint<T extends Record<string, unknown>>(
  value: T,
  schemaUrl: string,
): WithSchemaHint<T> {
  return { $schema: schemaUrl, ...value };
}
