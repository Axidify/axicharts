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

export type ShareImportValidationResult = {
  schemaOk: boolean;
  semanticOk: boolean;
  ok: boolean;
  schemaErrors: SchemaValidationIssue[];
  semanticErrors: RuntimeValidationIssue[];
  export?: ShareExport;
};

export function validateShareImportJson(json: string): ShareImportValidationResult {
  const schema = validateShareExportSchemaJson(json);
  const semantic = validateShareExportJson(json);

  return {
    schemaOk: schema.ok,
    semanticOk: semantic.ok,
    ok: schema.ok && semantic.ok,
    schemaErrors: schema.ok ? [] : schema.errors,
    semanticErrors: semantic.ok ? [] : semantic.errors,
    export: semantic.ok ? semantic.export : undefined,
  };
}
