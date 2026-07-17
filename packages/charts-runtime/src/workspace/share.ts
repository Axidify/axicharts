import { serializeRuntimeSpec } from "../runtimeSpec";
import {
  formatValidationErrors,
  validateRuntimeSpecRaw,
} from "../runtimeValidation";
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

export type ShareValidationResult =
  | { ok: true; export: ShareExport }
  | { ok: false; errors: import("../runtimeValidation").RuntimeValidationIssue[] };

export type SerializeExportOptions = {
  exportedAt?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nowIso(): string {
  return new Date().toISOString();
}

function validateSpecObject(
  spec: unknown,
  path: string,
): RuntimeDashboardSpec {
  const result = validateRuntimeSpecRaw(spec);
  if (!result.ok) {
    throw new Error(
      result.errors.map((item) => `${path}.${item.path}: ${item.message}`).join("; "),
    );
  }
  return result.spec;
}

export function validateShareExportJson(json: string): ShareValidationResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, errors: [{ path: "$", message: `invalid JSON: ${message}` }] };
  }

  if (!isRecord(raw)) {
    return { ok: false, errors: [{ path: "$", message: "share export must be a JSON object" }] };
  }

  try {
    if (raw.kind === "workspace") {
      if (!Array.isArray(raw.dashboards) || raw.dashboards.length === 0) {
        return {
          ok: false,
          errors: [{ path: "dashboards", message: "workspace export requires dashboards" }],
        };
      }

      const dashboards = raw.dashboards.map((item, index) => {
        if (!isRecord(item) || !isRecord(item.spec)) {
          throw new Error(`Workspace dashboard ${index + 1} is invalid`);
        }
        return {
          name: typeof item.name === "string" ? item.name : `Dashboard ${index + 1}`,
          meta: item.meta as SavedDashboard["meta"] | undefined,
          spec: validateSpecObject(item.spec, `dashboards[${index}].spec`),
        };
      });

      return {
        ok: true,
        export: {
          version: 1,
          kind: "workspace",
          exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : nowIso(),
          name: typeof raw.name === "string" ? raw.name : "Imported workspace",
          dashboards,
        },
      };
    }

    if (raw.kind === "dashboard" || "spec" in raw) {
      const parsed = parseDashboardEnvelope(raw);
      return {
        ok: true,
        export: {
          version: 1,
          kind: "dashboard",
          exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : nowIso(),
          name: parsed.name ?? "Imported dashboard",
          meta: parsed.meta,
          spec: parsed.spec,
        },
      };
    }

    const spec = validateSpecObject(raw, "$");
    return {
      ok: true,
      export: {
        version: 1,
        kind: "dashboard",
        exportedAt: nowIso(),
        name: "Imported dashboard",
        spec,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, errors: [{ path: "$", message }] };
  }
}

export function serializeDashboardExport(
  name: string,
  spec: RuntimeDashboardSpec,
  meta?: SavedDashboard["meta"],
  options?: SerializeExportOptions,
): string {
  const validated = validateSpecObject(spec, "spec");
  const envelope: DashboardExport = {
    version: 1,
    kind: "dashboard",
    exportedAt: options?.exportedAt ?? nowIso(),
    name,
    meta,
    spec: JSON.parse(serializeRuntimeSpec(validated, false)) as RuntimeDashboardSpec,
  };
  return JSON.stringify(envelope, null, 2);
}

export function serializeWorkspaceExport(
  workspace: Workspace,
  options?: SerializeExportOptions,
): string {
  const envelope: WorkspaceShareExport = {
    version: 1,
    kind: "workspace",
    exportedAt: options?.exportedAt ?? nowIso(),
    name: workspace.name,
    dashboards: workspace.dashboards.map((dashboard, index) => ({
      name: dashboard.name,
      meta: dashboard.meta,
      spec: validateSpecObject(
        JSON.parse(dashboard.specJson),
        `dashboards[${index}].spec`,
      ),
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
    spec: validateSpecObject(spec, "spec"),
  };
}

export function parseShareExport(json: string): ShareExport {
  const result = validateShareExportJson(json);
  if (!result.ok) {
    throw new Error(formatValidationErrors(result.errors));
  }
  return result.export;
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
