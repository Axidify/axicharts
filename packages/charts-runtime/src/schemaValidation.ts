import Ajv, { type ErrorObject, type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import runtimeSchemaJson from "../schema/runtime-spec.schema.json";
import shareSchemaJson from "../schema/share-export.schema.json";

export type SchemaValidationIssue = {
  path: string;
  message: string;
};

export type SchemaValidationResult =
  | { ok: true }
  | { ok: false; errors: SchemaValidationIssue[] };

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validateRuntimeSchema = ajv.compile(runtimeSchemaJson as object);
const validateShareSchema = ajv.compile(shareSchemaJson as object);

function formatAjvErrors(errors: ErrorObject[] | null | undefined): SchemaValidationIssue[] {
  return (errors ?? []).map((error) => ({
    path: error.instancePath ? error.instancePath.replace(/^\//, "") || "$" : "$",
    message: error.message ?? "schema validation failed",
  }));
}

function validateParsed(
  validate: ValidateFunction,
  raw: unknown,
): SchemaValidationResult {
  if (!validate(raw)) {
    return { ok: false, errors: formatAjvErrors(validate.errors) };
  }
  return { ok: true };
}

function parseJson(json: string): { ok: true; raw: unknown } | { ok: false; errors: SchemaValidationIssue[] } {
  try {
    return { ok: true, raw: JSON.parse(json) as unknown };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, errors: [{ path: "$", message: `invalid JSON: ${message}` }] };
  }
}

export function validateRuntimeSpecSchemaRaw(raw: unknown): SchemaValidationResult {
  return validateParsed(validateRuntimeSchema, raw);
}

export function validateShareExportSchemaRaw(raw: unknown): SchemaValidationResult {
  return validateParsed(validateShareSchema, raw);
}

export function validateRuntimeSpecSchemaJson(json: string): SchemaValidationResult {
  const parsed = parseJson(json);
  if (!parsed.ok) return parsed;
  return validateRuntimeSpecSchemaRaw(parsed.raw);
}

export function validateShareExportSchemaJson(json: string): SchemaValidationResult {
  const parsed = parseJson(json);
  if (!parsed.ok) return parsed;
  return validateShareExportSchemaRaw(parsed.raw);
}

export function formatSchemaValidationErrors(errors: SchemaValidationIssue[]): string {
  return errors.map((item) => `${item.path}: ${item.message}`).join("; ");
}
