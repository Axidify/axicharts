import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv, { type ErrorObject, type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";

export type SchemaValidationIssue = {
  path: string;
  message: string;
};

export type SchemaValidationResult =
  | { ok: true }
  | { ok: false; errors: SchemaValidationIssue[] };

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemaDir = join(packageRoot, "schema");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

let validateRuntimeSchema: ValidateFunction | undefined;
let validateShareSchema: ValidateFunction | undefined;

function loadValidator(name: string): ValidateFunction {
  const schema = JSON.parse(readFileSync(join(schemaDir, name), "utf8")) as object;
  return ajv.compile(schema);
}

function getRuntimeValidator(): ValidateFunction {
  validateRuntimeSchema ??= loadValidator("runtime-spec.schema.json");
  return validateRuntimeSchema;
}

function getShareValidator(): ValidateFunction {
  validateShareSchema ??= loadValidator("share-export.schema.json");
  return validateShareSchema;
}

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
  return validateParsed(getRuntimeValidator(), raw);
}

export function validateShareExportSchemaRaw(raw: unknown): SchemaValidationResult {
  return validateParsed(getShareValidator(), raw);
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
