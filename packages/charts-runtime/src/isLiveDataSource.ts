import type { DataSourceSpec } from "./types";

export function isLiveDataSource(spec: DataSourceSpec | undefined): boolean {
  if (!spec) return false;
  return (
    spec.type === "mock-live" ||
    spec.type === "historian" ||
    spec.type === "websocket" ||
    spec.type === "mqtt"
  );
}
