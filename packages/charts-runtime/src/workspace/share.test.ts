import { describe, expect, it } from "vitest";
import type { RuntimeDashboardSpec } from "../types";
import { SHARE_EXPORT_SCHEMA_URL } from "../schemaUrls";
import { createDefaultWorkspaceStore, importSharedWorkspace } from "./store";
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

describe("dashboard export", () => {
  it("round-trips envelope with meta", () => {
    const json = serializeDashboardExport("Ops wall", spec, {
      layout: "embed",
      feed: "historian",
      template: "ops-2x2",
      presentation: true,
    });
    const parsed = JSON.parse(json) as { $schema?: string };
    expect(parsed.$schema).toBe(SHARE_EXPORT_SCHEMA_URL);
    const exported = parseDashboardExport(json);
    expect(exported.name).toBe("Ops wall");
    expect(exported.meta?.presentation).toBe(true);
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
