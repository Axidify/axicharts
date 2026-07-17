import type { DataSourceSnapshot, MockLiveDataSourceSpec } from "../types";

function cloneData(data: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function connectMockLiveSource(
  spec: MockLiveDataSourceSpec,
  onUpdate: (snapshot: DataSourceSnapshot) => void,
): () => void {
  let data = cloneData(spec.data);
  const intervalMs = spec.intervalMs ?? 1000;

  const tick = () => {
    data = spec.mutate ? spec.mutate(data) : data;
    onUpdate({
      data,
      connection: "ready",
      lastUpdatedAt: Date.now(),
    });
  };

  tick();
  const timer = setInterval(tick, intervalMs);
  return () => clearInterval(timer);
}
