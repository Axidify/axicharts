export const RUNTIME_SPEC_SCHEMA_URL =
  "https://axidify.github.io/axicharts/schema/runtime-spec.schema.json";

export const SHARE_EXPORT_SCHEMA_URL =
  "https://axidify.github.io/axicharts/schema/share-export.schema.json";

export const HOSTED_EXAMPLES_BASE_URL =
  "https://axidify.github.io/axicharts/examples/";

export type HostedImportPreset = {
  id: string;
  label: string;
  filename: string;
};

export const HOSTED_IMPORT_PRESETS: HostedImportPreset[] = [
  { id: "ops-embed", label: "Ops embed", filename: "ops-embed.runtime.json" },
  { id: "ops-mosaic", label: "Ops mosaic", filename: "ops-mosaic.runtime.json" },
  { id: "ops-dashboard", label: "Dashboard share", filename: "ops-dashboard.share.json" },
  { id: "ops-workspace", label: "Workspace bundle", filename: "ops-workspace.workspace.json" },
];

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

export function importGalleryDeepLink(presetId: string, basePath = "/runtime/import"): string {
  return `${basePath}?preset=${encodeURIComponent(presetId)}`;
}

export function dashboarderImportDeepLink(
  presetId: string,
  origin = "http://localhost:3000",
): string {
  const base = origin.endsWith("/") ? origin.slice(0, -1) : origin;
  return `${base}/?import=${encodeURIComponent(presetId)}`;
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
