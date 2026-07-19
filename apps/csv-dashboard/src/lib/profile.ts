import type { DataProfile } from "@axicharts/charts-spec";

const TIME_FIELD = /^(time|date|week|month|day|timestamp|ts)$/i;

export function profileFromRows(rows: Record<string, unknown>[]): DataProfile {
  const fields = rows.length > 0 ? Object.keys(rows[0]) : [];
  const metrics = fields
    .filter((name) => !TIME_FIELD.test(name))
    .filter((name) => rows.some((row) => typeof row[name] === "number"))
    .map((name) => ({ name }));

  return { metrics, fields };
}
