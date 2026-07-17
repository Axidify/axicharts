import { describe, expect, it } from "vitest";
import type { RuntimeDashboardSpec } from "../types";
import { createDefaultWorkspaceStore, importSharedWorkspace } from "./store";
import {
  parseDashboardExport,
  parseShareExport,
  serializeDashboardExport,
  serializeWorkspaceExport,
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
    const parsed = parseDashboardExport(json);
    expect(parsed.name).toBe("Ops wall");
    expect(parsed.meta?.presentation).toBe(true);
    expect(parsed.spec.dashboard?.template).toBe("ops-2x2");
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
});
