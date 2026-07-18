import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuntimeDashboardSpec } from "../types";
import { SHARE_EXPORT_SCHEMA_URL } from "../schemaUrls";
import {
  createDefaultWorkspaceStore,
  getActiveDashboard,
  importSharedWorkspace,
  saveDashboardSpec,
} from "./store";
import {
  parseDashboardExport,
  parseShareExport,
  serializeDashboardExport,
  serializeWorkspaceExport,
  validateShareExportJson,
} from "./share";

const spec: RuntimeDashboardSpec = {
  layout: "embed",
  dashboard: {
    title: "Export test",
    template: "ops-2x2",
  },
};

const examplesDir = join(dirname(fileURLToPath(import.meta.url)), "../../examples");

function readExample(name: string): string {
  return readFileSync(join(examplesDir, name), "utf8");
}

describe("dashboard export", () => {
  it("round-trips envelope with meta", () => {
    const deck = {
      version: 1 as const,
      slides: [{ id: "kpis", title: "KPIs", section: "kpis" as const }],
    };
    const json = serializeDashboardExport("Ops wall", spec, {
      layout: "embed",
      feed: "historian",
      template: "ops-2x2",
      presentation: true,
      presentationDeck: deck,
    });
    const parsed = JSON.parse(json) as { $schema?: string };
    expect(parsed.$schema).toBe(SHARE_EXPORT_SCHEMA_URL);
    const exported = parseDashboardExport(json);
    expect(exported.name).toBe("Ops wall");
    expect(exported.meta?.presentation).toBe(true);
    expect(exported.meta?.presentationDeck?.slides).toHaveLength(1);
    expect(exported.spec.dashboard?.template).toBe("ops-2x2");
  });

  it("accepts imports that include $schema", () => {
    const json = serializeDashboardExport("Schema hint", spec);
    const result = validateShareExportJson(json);
    expect(result.ok).toBe(true);
  });

  it("parses legacy bare runtime JSON", () => {
    const parsed = parseDashboardExport(JSON.stringify(spec));
    expect(parsed.spec.dashboard?.template).toBe("ops-2x2");
  });
});

describe("workspace share export", () => {
  it("serializes and imports a workspace bundle", () => {
    const store = createDefaultWorkspaceStore(spec);
    const workspace = store.workspaces[0]!;
    const json = serializeWorkspaceExport(workspace);
    const parsed = parseShareExport(json);
    expect(parsed.kind).toBe("workspace");
    if (parsed.kind !== "workspace") return;

    const next = importSharedWorkspace(store, parsed);
    expect(next.workspaces).toHaveLength(2);
    expect(next.activeWorkspaceId).not.toBe(store.activeWorkspaceId);
    expect(next.workspaces[1]?.dashboards).toHaveLength(1);
  });

  it("rejects invalid dashboard exports", () => {
    const json = JSON.stringify({
      version: 1,
      kind: "dashboard",
      exportedAt: "2026-01-01T00:00:00.000Z",
      name: "Broken",
      spec: { layout: "embed", dashboard: { template: "not-real" } },
    });
    const result = validateShareExportJson(json);
    expect(result.ok).toBe(false);
  });
});

describe("share import meta", () => {
  it("parses shipped ops-dashboard fixture meta", () => {
    const exported = parseDashboardExport(readExample("ops-dashboard.share.json"));
    expect(exported.meta?.layout).toBe("embed");
    expect(exported.meta?.feed).toBe("static");
    expect(exported.meta?.template).toBe("ops-2x2");
  });

  it("saveDashboardSpec preserves meta from share import", () => {
    const exported = parseDashboardExport(readExample("ops-dashboard.share.json"));
    const store = createDefaultWorkspaceStore(spec);
    const workspace = store.workspaces[0]!;
    const dashboard = workspace.dashboards[0]!;
    const next = saveDashboardSpec(store, workspace.id, dashboard.id, exported.spec, {
      name: exported.name,
      meta: exported.meta,
    });
    const saved = getActiveDashboard(next);
    expect(saved.name).toBe("Line 3");
    expect(saved.meta).toEqual(exported.meta);
    expect(saved.meta?.chartConfig?.Errors?.tone).toBe("warning");
  });

  it("round-trips chartConfig in spec and meta", () => {
    const chartConfig = {
      CPU: { label: "CPU util", tone: "info" as const },
      Errors: { label: "Error rate", tone: "warning" as const },
    };
    const json = serializeDashboardExport(
      "Ops wall",
      {
        layout: "embed",
        dashboard: {
          title: "Ops",
          template: "ops-2x2",
          chartConfig,
          data: {
            categories: ["Mon", "Tue"],
            cells: [{ title: "CPU", data: [22, 28], suffix: "%" }],
          },
        },
      },
      {
        layout: "embed",
        feed: "static",
        template: "ops-2x2",
        chartConfig,
      },
    );
    const exported = parseDashboardExport(json);
    expect(exported.meta?.chartConfig).toEqual(chartConfig);
    expect(exported.spec.dashboard?.chartConfig).toEqual(chartConfig);
  });

  it("importSharedWorkspace preserves per-dashboard meta", () => {
    const parsed = parseShareExport(readExample("ops-workspace.workspace.json"));
    if (parsed.kind !== "workspace") throw new Error("expected workspace export");
    const store = createDefaultWorkspaceStore(spec);
    const next = importSharedWorkspace(store, parsed);
    const imported = next.workspaces.find((item) => item.id === next.activeWorkspaceId);
    const withMeta = imported?.dashboards.filter((item) => item.meta?.feed) ?? [];
    expect(withMeta.length).toBeGreaterThan(0);
  });
});
