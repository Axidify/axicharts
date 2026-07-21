import {
  aggregateRows,
  type AggregateOp,
  type AggregateRowsOptions,
  type AggregateSpec,
} from "./aggregateRows";

export type { AggregateOp, AggregateRowsOptions, AggregateSpec };

export type TransformOpCatalog = {
  aggregateOps: AggregateOp[];
  whereOps: Array<NonNullable<AggregateRowsOptions["where"]>[number]["op"]>;
  description: string;
};

/**
 * C174 — closed transform algebra surface for agents (groupBy + aggregates + where).
 */
export function listTransformOps(): TransformOpCatalog {
  return {
    aggregateOps: ["sum", "last", "count"],
    whereOps: ["eq", "neq", "gt", "gte", "lt", "lte"],
    description:
      "execute_transform groups rows with aggregateRows — use before compose_panel when recipe has groupBy",
  };
}

/**
 * C174 — run tabular transform (aggregateRows) and return chart-ready rows.
 */
export function executeTransform(
  rows: Record<string, unknown>[],
  transform: AggregateRowsOptions,
): Record<string, unknown>[] {
  return aggregateRows(rows, transform);
}
