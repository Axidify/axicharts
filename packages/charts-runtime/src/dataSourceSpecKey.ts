import type { BoundDataSourceSpec, DataSourceSpec } from "./types";

function stableJson(value: unknown): string {
  return JSON.stringify(value);
}

/** Serializable identity for data-source specs — ignores function refs (fetch, mapResponse, …). */
export function dataSourceSpecKey(spec: DataSourceSpec | undefined): string {
  if (!spec) return "";
  const id = spec.id ?? "";
  switch (spec.type) {
    case "static":
      return `${id}|static|${stableJson(spec.data)}`;
    case "mock-live":
      return `${id}|mock-live|${stableJson(spec.data)}|${spec.intervalMs ?? ""}`;
    case "rest":
      return `${id}|rest|${spec.url}|${spec.intervalMs ?? ""}|${spec.staleAfterMs ?? ""}`;
    case "historian":
      return `${id}|historian|${spec.url}|${spec.intervalMs ?? ""}|${spec.windowMs ?? ""}|${(spec.tags ?? []).join(",")}`;
    case "websocket":
      return `${id}|websocket|${spec.url}|${spec.staleAfterMs ?? ""}|${spec.reconnectDelayMs ?? ""}`;
    case "mqtt":
      return `${id}|mqtt|${spec.url}|${spec.topic}|${spec.staleAfterMs ?? ""}|${spec.clientId ?? ""}`;
    default:
      return `${id}|unknown`;
  }
}

export function boundDataSourcesKey(sources: BoundDataSourceSpec[] | undefined): string {
  if (!sources?.length) return "";
  return sources.map((source) => dataSourceSpecKey(source)).join(";;");
}
