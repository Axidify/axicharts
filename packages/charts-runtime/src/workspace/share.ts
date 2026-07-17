import { parseRuntimeSpec, serializeRuntimeSpec } from "../runtimeSpec";
import type { RuntimeDashboardSpec } from "../types";
import type { SavedDashboard, Workspace } from "./types";

export type DashboardExport = {
  version: 1;
  kind: "dashboard";
  exportedAt: string;
  name: string;
  meta?: SavedDashboard["meta"];
  spec: RuntimeDashboardSpec;
};

export type WorkspaceShareExport = {
  version: 1;
  kind: "workspace";
  exportedAt: string;
  name: string;
  dashboards: Array<{
    name: string;
    meta?: SavedDashboard["meta"];
    spec: RuntimeDashboardSpec;
  }>;
};

export type ShareExport = DashboardExport | WorkspaceShareExport;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nowIso(): string {
  return new Date().toISOString();
}

export function serializeDashboardExport(
  name: string,
  spec: RuntimeDashboardSpec,
  meta?: SavedDashboard["meta"],
): string {
  const envelope: DashboardExport = {
    version: 1,
    kind: "dashboard",
    exportedAt: nowIso(),
    name,
    meta,
    spec: JSON.parse(serializeRuntimeSpec(spec, false)) as RuntimeDashboardSpec,
  };
  return JSON.stringify(envelope, null, 2);
}

export function serializeWorkspaceExport(workspace: Workspace): string {
  const envelope: WorkspaceShareExport = {
    version: 1,
    kind: "workspace",
    exportedAt: nowIso(),
    name: workspace.name,
    dashboards: workspace.dashboards.map((dashboard) => ({
      name: dashboard.name,
      meta: dashboard.meta,
      spec: JSON.parse(dashboard.specJson) as RuntimeDashboardSpec,
    })),
  };
  return JSON.stringify(envelope, null, 2);
}

function parseDashboardEnvelope(raw: Record<string, unknown>): {
  name?: string;
  meta?: SavedDashboard["meta"];
  spec: RuntimeDashboardSpec;
} {
  const spec = raw.spec;
  if (!isRecord(spec)) {
    throw new Error("Dashboard export requires a spec object");
  }
  return {
    name: typeof raw.name === "string" ? raw.name : undefined,
    meta: raw.meta as SavedDashboard["meta"] | undefined,
    spec: spec as RuntimeDashboardSpec,
  };
}

function parseWorkspaceEnvelope(raw: Record<string, unknown>): WorkspaceShareExport {
  if (!Array.isArray(raw.dashboards) || raw.dashboards.length === 0) {
    throw new Error("Workspace export requires a dashboards array");
  }

  const dashboards = raw.dashboards.map((item, index) => {
    if (!isRecord(item) || !isRecord(item.spec)) {
      throw new Error(`Workspace dashboard ${index + 1} is invalid`);
    }
    return {
      name: typeof item.name === "string" ? item.name : `Dashboard ${index + 1}`,
      meta: item.meta as SavedDashboard["meta"] | undefined,
      spec: item.spec as RuntimeDashboardSpec,
    };
  });

  return {
    version: 1,
    kind: "workspace",
    exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : nowIso(),
    name: typeof raw.name === "string" ? raw.name : "Imported workspace",
    dashboards,
  };
}

export function parseShareExport(json: string): ShareExport {
  const raw = JSON.parse(json) as unknown;
  if (!isRecord(raw)) {
    throw new Error("Share export must be a JSON object");
  }

  if (raw.kind === "workspace") {
    return parseWorkspaceEnvelope(raw);
  }

  if (raw.kind === "dashboard" || "spec" in raw) {
    const parsed = parseDashboardEnvelope(raw);
    return {
      version: 1,
      kind: "dashboard",
      exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : nowIso(),
      name: parsed.name ?? "Imported dashboard",
      meta: parsed.meta,
      spec: parsed.spec,
    };
  }

  try {
    return {
      version: 1,
      kind: "dashboard",
      exportedAt: nowIso(),
      name: "Imported dashboard",
      spec: parseRuntimeSpec(json),
    };
  } catch {
    throw new Error("Unrecognized share export format");
  }
}

export function parseDashboardExport(json: string): {
  name?: string;
  meta?: SavedDashboard["meta"];
  spec: RuntimeDashboardSpec;
} {
  const parsed = parseShareExport(json);
  if (parsed.kind === "workspace") {
    throw new Error("Expected a dashboard export, received a workspace bundle");
  }
  return {
    name: parsed.name,
    meta: parsed.meta,
    spec: parsed.spec,
  };
}
