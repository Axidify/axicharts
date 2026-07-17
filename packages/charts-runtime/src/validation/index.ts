import {
  RUNTIME_SPEC_SCHEMA_URL,
  SHARE_EXPORT_SCHEMA_URL,
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
import {
  validateShareExportJson,
  type ShareExport,
  type ShareValidationResult,
} from "../workspace/share";

export {
  formatSchemaValidationErrors,
  validateRuntimeSpecSchemaJson,
  validateRuntimeSpecSchemaRaw,
  validateShareExportSchemaJson,
  validateShareExportSchemaRaw,
  validateShareExportJson,
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
