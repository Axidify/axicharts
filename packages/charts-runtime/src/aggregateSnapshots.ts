import type { DataSourceSnapshot } from "./types";

export const EMPTY_SNAPSHOT: DataSourceSnapshot = {
  data: {},
  connection: "idle",
};

/** Merge feed snapshot over dashboard seed data without wiping static rows on tick 0. */
export function mergeDashboardData(
  base: Record<string, unknown> | undefined,
  incoming: Record<string, unknown>,
): Record<string, unknown> {
  if (!base) return incoming;
  const merged = { ...base, ...incoming };
  const baseRows = Array.isArray(base.rows) ? base.rows : null;
  const incomingRows = Array.isArray(incoming.rows) ? incoming.rows : null;
  if (baseRows && baseRows.length > 0 && (!incomingRows || incomingRows.length === 0)) {
    merged.rows = baseRows;
  }
  return merged;
}

export function aggregateSnapshots(
  snapshots: Record<string, DataSourceSnapshot>,
  primaryId?: string,
): DataSourceSnapshot {
  const ids = Object.keys(snapshots);
  if (!ids.length) return EMPTY_SNAPSHOT;

  const primary =
    (primaryId ? snapshots[primaryId] : undefined) ?? snapshots[ids[0]] ?? EMPTY_SNAPSHOT;

  const connection = ids.some((id) => snapshots[id]?.connection === "error")
    ? "error"
    : ids.some((id) => snapshots[id]?.connection === "connecting")
      ? "connecting"
      : ids.every((id) => snapshots[id]?.connection === "ready")
        ? "ready"
        : primary.connection;

  const lastUpdatedAt = Math.max(
    ...ids.map((id) => snapshots[id]?.lastUpdatedAt ?? 0),
    0,
  );

  const error = ids
    .map((id) => snapshots[id]?.error)
    .find((message) => Boolean(message));

  const data = ids.reduce<Record<string, unknown>>((accumulator, id) => {
    return { ...accumulator, ...snapshots[id]?.data };
  }, {});

  return {
    data,
    connection,
    lastUpdatedAt: lastUpdatedAt || primary.lastUpdatedAt,
    error,
  };
}
