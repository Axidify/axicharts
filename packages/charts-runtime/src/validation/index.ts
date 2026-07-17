import {
  RUNTIME_SPEC_SCHEMA_URL,
  SHARE_EXPORT_SCHEMA_URL,
  HOSTED_EXAMPLES_BASE_URL,
  HOSTED_IMPORT_PRESETS,
  hostedImportPresetUrl,
  localImportPresetUrl,
  findImportPreset,
  parseImportPresetQuery,
  docsImportGalleryDeepLink,
  DOCS_SITE_ORIGIN,
  importGalleryDeepLink,
  dashboarderImportDeepLink,
  listImportDeepLinks,
  shareExportReferencePreset,
  SHARE_EXPORT_REFERENCE_PRESET,
  runtimeEmbedReferencePreset,
  RUNTIME_EMBED_REFERENCE_PRESET,
  plannerAdapterReferencePreset,
  feedAdapterGalleryDeepLink,
  type PlannerAdapterPlan,
  type PlannerFeedLike,
  isShareImportPreset,
  formatValidatePresetCommand,
  formatValidateFileCommand,
  ADAPTER_FIXTURE_PRESETS,
  IMPORT_GALLERY_ADAPTER_FILTERS,
  IMPORT_GALLERY_KIND_FILTERS,
  filterImportPresets,
  importGalleryFilterPath,
  isImportGalleryFilterActive,
  parseImportGalleryFilter,
  type ImportGalleryFilter,
  type ImportPresetAdapter,
  type ImportDeepLinkEntry,
  type ImportPresetKind,
  type HostedImportPreset,
} from "../schemaUrls";
import {
  formatSchemaValidationErrors,
  validateRuntimeSpecSchemaJson,
  validateRuntimeSpecSchemaRaw,
  validateShareExportSchemaJson,
  validateShareExportSchemaRaw,
  type SchemaValidationIssue,
  type SchemaValidationResult,
} from "../schemaValidation";
import type { RuntimeValidationIssue } from "../runtimeValidation";
import { validateRuntimeSpecJson } from "../runtimeValidation";
import {
  validateShareExportJson,
  type ShareExport,
  type ShareValidationResult,
} from "../workspace/share";
import type { RuntimeDashboardSpec } from "../types";

export {
  formatSchemaValidationErrors,
  validateRuntimeSpecSchemaJson,
  validateRuntimeSpecSchemaRaw,
  validateShareExportSchemaJson,
  validateShareExportSchemaRaw,
  validateShareExportJson,
  HOSTED_EXAMPLES_BASE_URL,
  HOSTED_IMPORT_PRESETS,
  hostedImportPresetUrl,
  localImportPresetUrl,
  findImportPreset,
  parseImportPresetQuery,
  docsImportGalleryDeepLink,
  DOCS_SITE_ORIGIN,
  importGalleryDeepLink,
  dashboarderImportDeepLink,
  listImportDeepLinks,
  shareExportReferencePreset,
  SHARE_EXPORT_REFERENCE_PRESET,
  runtimeEmbedReferencePreset,
  RUNTIME_EMBED_REFERENCE_PRESET,
  plannerAdapterReferencePreset,
  feedAdapterGalleryDeepLink,
  type PlannerAdapterPlan,
  type PlannerFeedLike,
  isShareImportPreset,
  formatValidatePresetCommand,
  formatValidateFileCommand,
  ADAPTER_FIXTURE_PRESETS,
  IMPORT_GALLERY_ADAPTER_FILTERS,
  IMPORT_GALLERY_KIND_FILTERS,
  filterImportPresets,
  importGalleryFilterPath,
  isImportGalleryFilterActive,
  parseImportGalleryFilter,
  RUNTIME_SPEC_SCHEMA_URL,
  SHARE_EXPORT_SCHEMA_URL,
  type ImportGalleryFilter,
  type ImportPresetAdapter,
  type HostedImportPreset,
  type ImportDeepLinkEntry,
  type ImportPresetKind,
  type RuntimeValidationIssue,
  type SchemaValidationIssue,
  type SchemaValidationResult,
  type ShareExport,
  type ShareValidationResult,
};

export type ImportShape = "share" | "runtime";

export type PortableImportValidationResult = {
  shape: ImportShape | null;
  schemaKind: "share-export" | "runtime-spec";
  schemaUrl: string;
  schemaOk: boolean;
  semanticOk: boolean;
  ok: boolean;
  schemaErrors: SchemaValidationIssue[];
  semanticErrors: RuntimeValidationIssue[];
  export?: ShareExport;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function detectImportShape(raw: unknown): ImportShape | null {
  if (!isRecord(raw)) return null;
  if (raw.kind === "workspace" || raw.kind === "dashboard" || "spec" in raw) {
    return "share";
  }
  return "runtime";
}

function emptyResult(
  overrides: Partial<PortableImportValidationResult> = {},
): PortableImportValidationResult {
  return {
    shape: null,
    schemaKind: "share-export",
    schemaUrl: SHARE_EXPORT_SCHEMA_URL,
    schemaOk: false,
    semanticOk: false,
    ok: false,
    schemaErrors: [],
    semanticErrors: [],
    ...overrides,
  };
}

export function validatePortableImportJson(json: string): PortableImportValidationResult {
  if (!json.trim()) {
    return emptyResult();
  }

  let raw: unknown;
  try {
    raw = JSON.parse(json) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const issue = { path: "$", message: `invalid JSON: ${message}` };
    return emptyResult({
      schemaErrors: [issue],
      semanticErrors: [issue],
    });
  }

  const shape = detectImportShape(raw);
  if (!shape) {
    const issue = { path: "$", message: "import JSON must be an object" };
    return emptyResult({
      schemaErrors: [issue],
      semanticErrors: [issue],
    });
  }

  const schemaKind = shape === "share" ? "share-export" : "runtime-spec";
  const schemaUrl = shape === "share" ? SHARE_EXPORT_SCHEMA_URL : RUNTIME_SPEC_SCHEMA_URL;
  const schema =
    shape === "share"
      ? validateShareExportSchemaRaw(raw)
      : validateRuntimeSpecSchemaRaw(raw);
  const semantic = validateShareExportJson(json);

  return {
    shape,
    schemaKind,
    schemaUrl,
    schemaOk: schema.ok,
    semanticOk: semantic.ok,
    ok: schema.ok && semantic.ok,
    schemaErrors: schema.ok ? [] : schema.errors,
    semanticErrors: semantic.ok ? [] : semantic.errors,
    export: semantic.ok ? semantic.export : undefined,
  };
}

export type RuntimeSpecDualValidationResult = {
  schemaUrl: string;
  schemaOk: boolean;
  semanticOk: boolean;
  ok: boolean;
  schemaErrors: SchemaValidationIssue[];
  semanticErrors: RuntimeValidationIssue[];
  spec?: RuntimeDashboardSpec;
};

export function validateRuntimeSpecDualJson(json: string): RuntimeSpecDualValidationResult {
  const schema = validateRuntimeSpecSchemaJson(json);
  const semantic = validateRuntimeSpecJson(json);

  return {
    schemaUrl: RUNTIME_SPEC_SCHEMA_URL,
    schemaOk: schema.ok,
    semanticOk: semantic.ok,
    ok: schema.ok && semantic.ok,
    schemaErrors: schema.ok ? [] : schema.errors,
    semanticErrors: semantic.ok ? [] : semantic.errors,
    spec: semantic.ok ? semantic.spec : undefined,
  };
}

export function validateShareExportDualJson(json: string): PortableImportValidationResult {
  const schema = validateShareExportSchemaJson(json);
  const semantic = validateShareExportJson(json);

  return {
    shape: "share",
    schemaKind: "share-export",
    schemaUrl: SHARE_EXPORT_SCHEMA_URL,
    schemaOk: schema.ok,
    semanticOk: semantic.ok,
    ok: schema.ok && semantic.ok,
    schemaErrors: schema.ok ? [] : schema.errors,
    semanticErrors: semantic.ok ? [] : semantic.errors,
    export: semantic.ok ? semantic.export : undefined,
  };
}

/** @deprecated Use validatePortableImportJson */
export const validateShareImportJson = validatePortableImportJson;

export {
  fetchImportPreset,
  type FetchImportPresetOptions,
  type FetchImportPresetResult,
  type ImportPresetSource,
} from "./importPresets";
