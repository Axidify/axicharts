import { parseRuntimeSpec, serializeRuntimeSpec } from "../runtimeSpec";
import type { RuntimeDashboardSpec } from "../types";
import type { SavedDashboard } from "./types";

export type DashboardExport = {
  version: 1;
  name: string;
  meta?: SavedDashboard["meta"];
  spec: RuntimeDashboardSpec;
};

export function serializeDashboardExport(
  name: string,
  spec: RuntimeDashboardSpec,
  meta?: SavedDashboard["meta"],
): string {
  const envelope: DashboardExport = {
    version: 1,
    name,
    meta,
    spec: JSON.parse(serializeRuntimeSpec(spec, false)) as RuntimeDashboardSpec,
  };
  return JSON.stringify(envelope, null, 2);
}

export function parseDashboardExport(json: string): {
  name?: string;
  meta?: SavedDashboard["meta"];
  spec: RuntimeDashboardSpec;
} {
  const raw = JSON.parse(json) as unknown;
  if (
    typeof raw === "object" &&
    raw !== null &&
    "spec" in raw &&
    typeof (raw as DashboardExport).spec === "object"
  ) {
    const envelope = raw as DashboardExport;
    return {
      name: envelope.name,
      meta: envelope.meta,
      spec: envelope.spec,
    };
  }

  return { spec: parseRuntimeSpec(json) };
}
