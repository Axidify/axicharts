import type { DataSourceSnapshot, HistorianDataSourceSpec } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type HistorianTag = {
  name: string;
  timestamps?: string[];
  categories?: string[];
  values: number[];
  suffix?: string;
  tone?: string;
};

export function buildHistorianUrl(
  spec: Pick<HistorianDataSourceSpec, "url" | "tags" | "windowMs">,
  now = Date.now(),
): string {
  const windowMs = spec.windowMs ?? 3_600_000;
  const from = now - windowMs;
  const base =
    typeof globalThis.location?.origin === "string"
      ? globalThis.location.origin
      : "http://localhost";
  const url = new URL(spec.url, base);

  url.searchParams.set("from", String(from));
  url.searchParams.set("to", String(now));
  if (spec.tags?.length) {
    url.searchParams.set("tags", spec.tags.join(","));
  }

  return url.toString();
}

export function defaultHistorianMapper(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) return {};

  if (payload.categories && payload.cells) return payload;
  if (payload.kpis || payload.waterfall || payload.series) return payload;

  const tags = payload.tags;
  if (Array.isArray(tags) && tags.length > 0) {
    const normalized = tags as HistorianTag[];
    const categories =
      normalized[0]?.timestamps ?? normalized[0]?.categories ?? [];
    return {
      categories,
      cells: normalized.map((tag) => ({
        title: tag.name,
        data: tag.values,
        suffix: tag.suffix,
        tone: tag.tone,
      })),
    };
  }

  const series = payload.series;
  if (Array.isArray(series) && series.length > 0) {
    const first = series[0] as HistorianTag;
    return {
      categories: first.timestamps ?? first.categories ?? [],
      series: series.map((item) => {
        const row = item as HistorianTag;
        return { name: row.name, data: row.values };
      }),
    };
  }

  return payload;
}

export function connectHistorianSource(
  spec: HistorianDataSourceSpec,
  onUpdate: (snapshot: DataSourceSnapshot) => void,
): () => void {
  const fetchImpl = spec.fetch ?? globalThis.fetch;
  const intervalMs = spec.intervalMs ?? 5000;
  const mapResponse = spec.mapResponse ?? defaultHistorianMapper;
  let cancelled = false;
  let timer: ReturnType<typeof setInterval> | undefined;

  const poll = async () => {
    if (cancelled) return;
    onUpdate({ data: {}, connection: "connecting" });
    try {
      const requestUrl = buildHistorianUrl(spec);
      const response = await fetchImpl(requestUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = (await response.json()) as unknown;
      if (cancelled) return;
      onUpdate({
        data: mapResponse(payload),
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
