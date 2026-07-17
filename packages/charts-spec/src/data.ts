import type { FieldEncoding, SpecData } from "./types";

export function asRows(data: SpecData): Record<string, unknown>[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.rows)) {
    return data.rows as Record<string, unknown>[];
  }
  return [];
}

export function pluckField(
  rows: Record<string, unknown>[],
  encoding: FieldEncoding,
): string[] | number[] {
  const values = rows.map((row) => row[encoding.field]);
  if (encoding.type === "quantitative") {
    return values.map((value) => Number(value));
  }
  return values.map((value) => String(value));
}

export function readNumber(data: SpecData, key: string): number | undefined {
  if (Array.isArray(data)) return undefined;
  const value = data[key];
  return typeof value === "number" ? value : undefined;
}

export function readArray<T>(data: SpecData, key: string): T[] | undefined {
  if (Array.isArray(data)) return undefined;
  const value = data[key];
  return Array.isArray(value) ? (value as T[]) : undefined;
}
