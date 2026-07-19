import type { FieldProfile } from "../../types";
import type { VerticalId } from "../../rulePacks/types";

export type TabularEnrichment = {
  vertical: VerticalId;
  rows: Record<string, unknown>[];
  derivedRows: Record<string, unknown>[];
  fieldProfiles: FieldProfile[];
  fieldMap: Record<string, string>;
  kpis: Record<string, number>;
  datasets: Record<string, Record<string, unknown>[]>;
  extras?: Record<string, unknown>;
};

export function findNamedField(fieldProfiles: FieldProfile[], pattern: RegExp): string {
  return fieldProfiles.find((profile) => pattern.test(profile.name))?.name ?? "";
}

export function parseAmount(raw: string): number {
  const cleaned = raw
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .replace(/\(RM\)/gi, "")
    .replace(/^RM/i, "")
    .replace(/RM$/i, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function cellNumber(row: Record<string, unknown>, field: string): number {
  const value = row[field];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value !== "" && value !== "-") {
    const num = Number(value.replace(/,/g, "").replace(/%/g, ""));
    if (Number.isFinite(num)) return num;
    return parseAmount(value);
  }
  return 0;
}

export function formatRm(value: number, decimals = 0): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}RM ${Math.abs(value).toLocaleString("en-MY", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatHours(value: number): string {
  return value.toLocaleString("en-MY", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
