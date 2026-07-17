import type { DataSourceSnapshot, RestDataSourceSpec } from "../types";
import { defaultRestMapper, mergeAdapterExtras } from "./normalize";

export function connectRestSource(
  spec: RestDataSourceSpec,
  onUpdate: (snapshot: DataSourceSnapshot) => void,
): () => void {
  const fetchImpl = spec.fetch ?? globalThis.fetch;
  const intervalMs = spec.intervalMs ?? 2000;
  const mapResponse = spec.mapResponse ?? defaultRestMapper;
  let cancelled = false;
  let hasConnected = false;
  let timer: ReturnType<typeof setInterval> | undefined;

  const poll = async () => {
    if (cancelled) return;
    if (!hasConnected) {
      onUpdate({ data: {}, connection: "connecting" });
    }
    try {
      const response = await fetchImpl(spec.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = (await response.json()) as unknown;
      const mapped = mapResponse(payload);
      if (cancelled) return;
      hasConnected = true;
      onUpdate({
        data: mergeAdapterExtras(mapped, payload),
        connection: "ready",
        lastUpdatedAt: Date.now(),
      });
    } catch (error) {
      if (cancelled) return;
      onUpdate({
        data: {},
        connection: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  void poll();
  timer = setInterval(() => {
    void poll();
  }, intervalMs);

  return () => {
    cancelled = true;
    if (timer) clearInterval(timer);
  };
}
