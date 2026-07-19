import type { FieldProfile, TabularGrain, TimeSpan } from "./types";
import {
  fieldProfilesToDataProfile,
  inferFieldRoles,
  type InferFieldRolesOptions,
} from "./inferFieldRoles";
import type { DataProfile } from "./types";

const HIGH_CARDINALITY_BAR = 12;

export { HIGH_CARDINALITY_BAR };

function distinctCount(rows: Record<string, unknown>[], field: string): number {
  const seen = new Set<string>();
  for (const row of rows) {
    const value = row[field];
    if (value == null || value === "") continue;
    seen.add(String(value));
  }
  return seen.size;
}

function parseDateMs(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? null : parsed;
}

function primaryTimeField(fieldProfiles: FieldProfile[]): string | undefined {
  return fieldProfiles.find((profile) => profile.role === "time")?.name;
}

function primaryIdentifierField(fieldProfiles: FieldProfile[]): string | undefined {
  return fieldProfiles.find((profile) => profile.role === "identifier")?.name;
}

export function computeCardinalities(
  rows: Record<string, unknown>[],
  fieldProfiles: FieldProfile[],
): Record<string, number> {
  const cardinalities: Record<string, number> = {};
  for (const profile of fieldProfiles) {
    if (profile.role === "measure") continue;
    cardinalities[profile.name] = distinctCount(rows, profile.name);
  }
  return cardinalities;
}

export function inferTimeSpan(
  rows: Record<string, unknown>[],
  fieldProfiles: FieldProfile[],
): TimeSpan | undefined {
  const field = primaryTimeField(fieldProfiles);
  if (!field || rows.length === 0) return undefined;

  let minMs: number | null = null;
  let maxMs: number | null = null;

  for (const row of rows) {
    const ms = parseDateMs(row[field]);
    if (ms == null) continue;
    minMs = minMs == null ? ms : Math.min(minMs, ms);
    maxMs = maxMs == null ? ms : Math.max(maxMs, ms);
  }

  if (minMs == null || maxMs == null) return undefined;

  return {
    field,
    from: new Date(minMs).toISOString().slice(0, 10),
    to: new Date(maxMs).toISOString().slice(0, 10),
  };
}

export function inferGrain(
  rows: Record<string, unknown>[],
  fieldProfiles: FieldProfile[],
  cardinalities: Record<string, number>,
): TabularGrain {
  if (rows.length === 0) return "unknown";

  const identifier = primaryIdentifierField(fieldProfiles);
  const timeField = primaryTimeField(fieldProfiles);

  if (identifier) {
    const idCardinality = cardinalities[identifier] ?? distinctCount(rows, identifier);
    const rowsPerId = rows.length / Math.max(idCardinality, 1);
    const isEventId = /transaction|trx|opportunity|deal|invoice|bill|ref/i.test(identifier);

    if (isEventId && rows.length > 1) return "transaction";
    if (rowsPerId <= 1.1) return "entity";
    if (timeField && rowsPerId > 1.25) return "transaction";
  }

  if (timeField) {
    const dateCount = cardinalities[timeField] ?? distinctCount(rows, timeField);
    if (dateCount >= 2) {
      const rowsPerDate = rows.length / dateCount;
      if (rowsPerDate <= 1.25) return "daily";
      if (!identifier) return "transaction";
    }
  }

  return "unknown";
}

/**
 * C165 — L1 tabular profile: roles, grain, cardinalities, and time span.
 */
export function profileTabular(
  rows: Record<string, unknown>[],
  options: InferFieldRolesOptions = {},
): DataProfile {
  const fieldProfiles = inferFieldRoles(rows, options);
  const cardinalities = computeCardinalities(rows, fieldProfiles);
  const timeSpan = inferTimeSpan(rows, fieldProfiles);
  const grain = inferGrain(rows, fieldProfiles, cardinalities);

  return {
    ...fieldProfilesToDataProfile(fieldProfiles),
    fieldProfiles,
    grain,
    timeSpan,
    cardinalities,
  };
}

export type TabularProfileContext = Pick<DataProfile, "grain" | "timeSpan" | "cardinalities">;

export function cardinalityOf(
  profile: TabularProfileContext | undefined,
  field: string | undefined,
): number | undefined {
  if (!profile?.cardinalities || !field) return undefined;
  return profile.cardinalities[field];
}

export function isHighCardinality(
  profile: TabularProfileContext | undefined,
  field: string | undefined,
): boolean {
  const count = cardinalityOf(profile, field);
  return count != null && count > HIGH_CARDINALITY_BAR;
}
