import type { DataSourceSnapshot, StaticDataSourceSpec } from "../types";

export function connectStaticSource(
  spec: StaticDataSourceSpec,
  onUpdate: (snapshot: DataSourceSnapshot) => void,
): () => void {
  onUpdate({
    data: spec.data,
    connection: "ready",
    lastUpdatedAt: Date.now(),
  });
  return () => {};
}
