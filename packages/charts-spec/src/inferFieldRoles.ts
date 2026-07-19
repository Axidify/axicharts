import type { FieldProfile, FieldRole } from "./types";
import { TIME_FIELD_RE } from "./profileInference";

const IDENTIFIER_FIELD_RE =
  /^(id|uuid|key|transaction|invoice|bill|ref|reference|no|number|trx|emp)/i;
const EMPLOYEE_ID_FIELD_RE = /\bemployee\s*id\b|\bstaff\s*id\b|\bemp\s*id\b/i;
const OPPORTUNITY_ID_FIELD_RE = /\b(opportunity|deal|lead)\s*id\b/i;
const CLOSE_DATE_FIELD_RE = /\bexpected\s*close\b|\bclose\s*date\b/i;
const MEASURE_FIELD_RE =
  /^(debit|credit|balance|amount|total|sum|value|price|cost|revenue|qty|quantity|volume|spend|hours|headcount|count|probability)$/i;
const DIMENSION_FIELD_RE =
  /(category|account|cost\s*center|department|vendor|customer|payment\s*method|method|type|status|region|name)/i;

/** Measure columns whose names also match TIME_FIELD_RE (e.g. "Hours"). */
const MEASURE_TIME_COLLISION_RE = /^hours$/i;

function isTimeFieldName(field: string): boolean {
  if (MEASURE_TIME_COLLISION_RE.test(field.trim())) return false;
  return TIME_FIELD_RE.test(field);
}

function sampleValues(rows: Record<string, unknown>[], field: string, limit = 8): unknown[] {
  return rows.slice(0, limit).map((row) => row[field]);
}

function isNumericColumn(rows: Record<string, unknown>[], field: string): boolean {
  const values = sampleValues(rows, field).filter((v) => v != null && v !== "");
  if (values.length === 0) return false;
  return values.every((v) => typeof v === "number" || (typeof v === "string" && !Number.isNaN(Number(v))));
}

function inferRoleFromName(field: string): FieldRole | undefined {
  if (EMPLOYEE_ID_FIELD_RE.test(field) || OPPORTUNITY_ID_FIELD_RE.test(field)) return "identifier";
  if (IDENTIFIER_FIELD_RE.test(field)) return "identifier";
  if (MEASURE_FIELD_RE.test(field.trim())) return "measure";
  if (CLOSE_DATE_FIELD_RE.test(field)) return "time";
  if (isTimeFieldName(field)) return "time";
  if (DIMENSION_FIELD_RE.test(field)) return "dimension";
  return undefined;
}

export type InferFieldRolesOptions = {
  /** Force roles for known export columns (agent hints). */
  hints?: Record<string, FieldRole>;
};

/**
 * C148a — infer semantic field roles from tabular rows for agent planners.
 */
export function inferFieldRoles(
  rows: Record<string, unknown>[],
  options: InferFieldRolesOptions = {},
): FieldProfile[] {
  if (rows.length === 0) return [];

  const fields = Object.keys(rows[0]);
  return fields.map((name) => {
    const hinted = options.hints?.[name];
    if (hinted) return { name, role: hinted };

    const fromName = inferRoleFromName(name);
    if (fromName) return { name, role: fromName };

    if (isNumericColumn(rows, name)) return { name, role: "measure" };
    return { name, role: "dimension" };
  });
}

export function fieldProfilesToDataProfile(
  fieldProfiles: FieldProfile[],
): Pick<import("./types").DataProfile, "fields" | "fieldProfiles" | "metrics"> {
  const fields = fieldProfiles.map((profile) => profile.name);
  const metrics = fieldProfiles
    .filter((profile) => profile.role === "measure")
    .map((profile) => ({ name: profile.name }));

  return { fields, fieldProfiles, metrics };
}

export function roleOfField(
  fieldProfiles: FieldProfile[] | undefined,
  field: string,
): FieldRole | undefined {
  return fieldProfiles?.find((profile) => profile.name === field)?.role;
}
