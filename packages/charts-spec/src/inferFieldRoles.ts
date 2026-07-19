import type { FieldProfile, FieldRole } from "./types";
import { TIME_FIELD_RE } from "./profileInference";

const IDENTIFIER_FIELD_RE =
  /^(id|uuid|key|transaction|invoice|bill|ref|reference|no|number|trx)/i;
const MEASURE_FIELD_RE =
  /^(debit|credit|balance|amount|total|sum|value|price|cost|revenue|qty|quantity|volume|spend)/i;
const DIMENSION_FIELD_RE =
  /(category|account|cost\s*center|department|vendor|customer|payment\s*method|method|type|status|region)/i;

function sampleValues(rows: Record<string, unknown>[], field: string, limit = 8): unknown[] {
  return rows.slice(0, limit).map((row) => row[field]);
}

function isNumericColumn(rows: Record<string, unknown>[], field: string): boolean {
  const values = sampleValues(rows, field).filter((v) => v != null && v !== "");
  if (values.length === 0) return false;
  return values.every((v) => typeof v === "number" || (typeof v === "string" && !Number.isNaN(Number(v))));
}

function inferRoleFromName(field: string): FieldRole | undefined {
  if (TIME_FIELD_RE.test(field)) return "time";
  if (IDENTIFIER_FIELD_RE.test(field)) return "identifier";
  if (MEASURE_FIELD_RE.test(field)) return "measure";
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
