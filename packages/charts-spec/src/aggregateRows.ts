export type AggregateOp = "sum" | "last" | "count";

export type AggregateSpec =
  | { op: "sum"; field: string }
  | { op: "sum"; fields: string[] }
  | { op: "last"; field: string }
  | { op: "count" };

export type AggregateRowsOptions = {
  groupBy: string;
  aggregates: Record<string, AggregateSpec>;
};

function cellNumber(row: Record<string, unknown>, field: string): number {
  const value = row[field];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value !== "") {
    const num = Number(value.replace(/,/g, ""));
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
}

function applyAggregate(
  rows: Record<string, unknown>[],
  spec: AggregateSpec,
): number {
  switch (spec.op) {
    case "count":
      return rows.length;
    case "last":
      return rows.length > 0 ? cellNumber(rows[rows.length - 1], spec.field) : 0;
    case "sum":
      if ("fields" in spec) {
        return spec.fields.reduce(
          (total, field) =>
            total + rows.reduce((sum, row) => sum + cellNumber(row, field), 0),
          0,
        );
      }
      return rows.reduce((sum, row) => sum + cellNumber(row, spec.field), 0);
    default:
      return 0;
  }
}

/**
 * C148b — group tabular rows into chart-ready aggregates.
 */
export function aggregateRows(
  rows: Record<string, unknown>[],
  options: AggregateRowsOptions,
): Record<string, string | number>[] {
  const { groupBy, aggregates } = options;
  const groups = new Map<string, Record<string, unknown>[]>();

  for (const row of rows) {
    const key = String(row[groupBy] ?? "Unknown");
    const bucket = groups.get(key) ?? [];
    bucket.push(row);
    groups.set(key, bucket);
  }

  return [...groups.entries()].map(([key, bucket]) => {
    const out: Record<string, string | number> = { [groupBy]: key };
    for (const [alias, spec] of Object.entries(aggregates)) {
      out[alias] = applyAggregate(bucket, spec);
    }
    return out;
  });
}
