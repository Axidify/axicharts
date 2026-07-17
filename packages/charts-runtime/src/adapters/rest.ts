import type { DataSourceSnapshot, RestDataSourceSpec } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function connectRestSource(
  spec: RestDataSourceSpec,
  onUpdate: (snapshot: DataSourceSnapshot) => void,
): () => void {
  const fetchImpl = spec.fetch ?? globalThis.fetch;
  const intervalMs = spec.intervalMs ?? 2000;
  let cancelled = false;
  let timer: ReturnType<typeof setInterval> | undefined;

  const poll = async () => {
    if (cancelled) return;
    onUpdate({ data: {}, connection: "connecting" });
    try {
      const response = await fetchImpl(spec.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = (await response.json()) as unknown;
      if (!isRecord(payload)) {
        throw new Error("REST adapter expects a JSON object");
      }
      if (cancelled) return;
      onUpdate({
        data: payload,
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
