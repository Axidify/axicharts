import Ajv, { type ErrorObject, type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import cartesianPanelSchemaJson from "../schema/cartesian-panel.schema.json";
import dataProfileSchemaJson from "../schema/data-profile.schema.json";

export type SchemaValidationIssue = {
  path: string;
  message: string;
};

export type SchemaValidationResult =
  | { ok: true }
  | { ok: false; errors: SchemaValidationIssue[] };

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validateCartesianPanelSchema = ajv.compile(cartesianPanelSchemaJson as object);
const validateDataProfileSchema = ajv.compile(dataProfileSchemaJson as object);

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

export function validateCartesianPanelSchemaRaw(raw: unknown): SchemaValidationResult {
  return validateParsed(validateCartesianPanelSchema, raw);
}

export function validateDataProfileSchemaRaw(raw: unknown): SchemaValidationResult {
  return validateParsed(validateDataProfileSchema, raw);
}

export {
  CARTESIAN_PANEL_SCHEMA_URL,
  DATA_PROFILE_SCHEMA_URL,
  HOSTED_CARTESIAN_PANEL_SCHEMA_URL,
  HOSTED_DATA_PROFILE_SCHEMA_URL,
} from "./schemaUrls";
