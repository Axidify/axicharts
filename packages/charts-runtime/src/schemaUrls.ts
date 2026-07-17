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
    id: "ops-rest",
    label: "REST embed",
    filename: "ops-rest.runtime.json",
    kind: "runtime",
    adapter: "rest",
  },
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
    id: "ops-websocket",
    label: "WebSocket mosaic",
    filename: "ops-websocket.runtime.json",
    kind: "runtime",
    adapter: "websocket",
  },
  {
    id: "ops-mock-live",
    label: "Mock-live embed",
    filename: "ops-mock-live.runtime.json",
    kind: "runtime",
    adapter: "mock-live",
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

export const ADAPTER_FIXTURE_PRESETS: Partial<Record<ImportPresetAdapter, string>> = {
  static: "ops-embed",
  mosaic: "ops-mosaic",
  rest: "ops-rest",
  historian: "ops-historian",
  mqtt: "ops-mqtt",
  websocket: "ops-websocket",
  "mock-live": "ops-mock-live",
};

export const IMPORT_GALLERY_ADAPTER_FILTERS: ImportPresetAdapter[] = [
  "static",
  "mosaic",
  "rest",
  "historian",
  "mqtt",
  "websocket",
  "mock-live",
];

export const IMPORT_GALLERY_KIND_FILTERS: ImportPresetKind[] = [
  "runtime",
  "dashboard",
  "workspace",
];

export type ImportGalleryFilter =
  | { type: "all" }
  | { type: "kind"; value: ImportPresetKind }
  | { type: "adapter"; value: ImportPresetAdapter };

function isImportPresetAdapter(value: string): value is ImportPresetAdapter {
  return IMPORT_GALLERY_ADAPTER_FILTERS.includes(value as ImportPresetAdapter);
}

export function parseImportGalleryFilter(search: string): ImportGalleryFilter {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const adapter = params.get("adapter");
  if (adapter && isImportPresetAdapter(adapter)) {
    return { type: "adapter", value: adapter };
  }
  const kind = params.get("kind");
  if (kind === "runtime" || kind === "dashboard" || kind === "workspace") {
    return { type: "kind", value: kind };
  }
  return { type: "all" };
}

export function filterImportPresets(filter: ImportGalleryFilter): HostedImportPreset[] {
  if (filter.type === "all") return HOSTED_IMPORT_PRESETS;
  if (filter.type === "kind") {
    return HOSTED_IMPORT_PRESETS.filter((preset) => preset.kind === filter.value);
  }
  return HOSTED_IMPORT_PRESETS.filter((preset) => preset.adapter === filter.value);
}

export function importGalleryFilterPath(
  filter: ImportGalleryFilter,
  basePath = "/runtime/import",
): string {
  if (filter.type === "all") return basePath;
  if (filter.type === "kind") return `${basePath}?kind=${filter.value}`;
  return `${basePath}?adapter=${encodeURIComponent(filter.value)}`;
}

export function isImportGalleryFilterActive(
  current: ImportGalleryFilter,
  candidate: ImportGalleryFilter,
): boolean {
  if (current.type !== candidate.type) return false;
  if (current.type === "all") return true;
  if (current.type === "kind" && candidate.type === "kind") {
    return current.value === candidate.value;
  }
  if (current.type === "adapter" && candidate.type === "adapter") {
    return current.value === candidate.value;
  }
  return false;
}

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

export type PlannerAdapterPlan = {
  layout: "embed" | "mosaic";
  feed: "static" | "historian" | "websocket" | "mqtt" | "rest" | "mock-live";
};

/** Maps planner layout + feed to the shipped adapter fixture preset. */
export function plannerAdapterReferencePreset(
  plan: PlannerAdapterPlan,
): HostedImportPreset | undefined {
  if (plan.layout === "mosaic") {
    return findImportPreset(ADAPTER_FIXTURE_PRESETS.mosaic!);
  }
  const presetId = ADAPTER_FIXTURE_PRESETS[plan.feed];
  return presetId ? findImportPreset(presetId) : undefined;
}

export type PlannerAdapterFixture = {
  preset: HostedImportPreset;
  role: string;
};

/** Adapter fixture presets for planner preview — mosaic walls may surface multiple binds. */
export function plannerAdapterFixtures(plan: PlannerAdapterPlan): PlannerAdapterFixture[] {
  if (plan.layout !== "mosaic") {
    const preset = plannerAdapterReferencePreset(plan);
    return preset ? [{ preset, role: "embed" }] : [];
  }

  const fixtures: PlannerAdapterFixture[] = [];
  const wallPreset = findImportPreset(ADAPTER_FIXTURE_PRESETS.mosaic!);
  if (wallPreset) {
    fixtures.push({ preset: wallPreset, role: "mosaic wall" });
  }

  if (plan.feed !== "static") {
    const feedPresetId = ADAPTER_FIXTURE_PRESETS[plan.feed];
    const feedPreset = feedPresetId ? findImportPreset(feedPresetId) : undefined;
    if (feedPreset) {
      fixtures.push({ preset: feedPreset, role: `${plan.feed} bind` });
    }
  } else {
    const staticPreset = findImportPreset(ADAPTER_FIXTURE_PRESETS.static!);
    if (staticPreset && staticPreset.id !== wallPreset?.id) {
      fixtures.push({ preset: staticPreset, role: "static cells" });
    }
  }

  return fixtures;
}

export type PlannerFeedLike = PlannerAdapterPlan["feed"];

/** Docs gallery URL for a planner/builder feed + layout pair. */
export function feedAdapterGalleryDeepLink(
  feed: PlannerFeedLike,
  layout: PlannerAdapterPlan["layout"] = "embed",
  origin = DOCS_SITE_ORIGIN,
): string {
  const preset = plannerAdapterReferencePreset({ layout, feed });
  if (preset) return docsImportGalleryDeepLink(preset.id, origin);
  const base = origin.endsWith("/") ? origin.slice(0, -1) : origin;
  return `${base}${importGalleryFilterPath({ type: "adapter", value: feed })}`;
}

/** Docs gallery URL for a runtime adapter type. */
export function adapterFixtureGalleryDeepLink(
  adapter: ImportPresetAdapter,
  origin = DOCS_SITE_ORIGIN,
): string {
  const presetId = ADAPTER_FIXTURE_PRESETS[adapter];
  if (presetId) return docsImportGalleryDeepLink(presetId, origin);
  const base = origin.endsWith("/") ? origin.slice(0, -1) : origin;
  return `${base}${importGalleryFilterPath({ type: "adapter", value: adapter })}`;
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
