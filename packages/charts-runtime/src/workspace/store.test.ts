import { describe, expect, it } from "vitest";
import type { RuntimeDashboardSpec } from "../types";
import {
  addDashboard,
  createDefaultWorkspaceStore,
  deleteDashboard,
  getActiveDashboard,
  loadWorkspaceStore,
  saveDashboardSpec,
  selectDashboard,
} from "./store";
import { LEGACY_RUNTIME_SPEC_KEY } from "./types";

const seedSpec: RuntimeDashboardSpec = {
  layout: "embed",
  dashboard: {
    title: "Seed",
    template: "ops-2x2",
    data: { categories: ["A"], cells: [] },
  },
};

describe("workspace store", () => {
  it("creates a default workspace with one dashboard", () => {
    const store = createDefaultWorkspaceStore(seedSpec);
    expect(store.workspaces).toHaveLength(1);
    expect(getActiveDashboard(store).name).toBe("Ops overview");
  });

  it("saves dashboard spec updates", () => {
    const store = createDefaultWorkspaceStore(seedSpec);
    const workspace = store.workspaces[0]!;
    const dashboard = workspace.dashboards[0]!;
    const nextSpec: RuntimeDashboardSpec = {
      layout: "embed",
      dashboard: {
        title: "Updated",
        template: "finance-pnl",
      },
    };

    const saved = saveDashboardSpec(store, workspace.id, dashboard.id, nextSpec);
    expect(getActiveDashboard(saved).specJson).toContain("finance-pnl");
  });

  it("saves planner meta alongside spec", () => {
    const store = createDefaultWorkspaceStore(seedSpec);
    const workspace = store.workspaces[0]!;
    const dashboard = workspace.dashboards[0]!;
    const saved = saveDashboardSpec(store, workspace.id, dashboard.id, seedSpec, {
      meta: {
        layout: "embed",
        feed: "rest",
        template: "ops-2x2",
        presentation: true,
      },
    });
    expect(getActiveDashboard(saved).meta).toEqual({
      layout: "embed",
      feed: "rest",
      template: "ops-2x2",
      presentation: true,
    });
  });

  it("adds dashboards to a workspace", () => {
    const store = createDefaultWorkspaceStore(seedSpec);
    const workspace = store.workspaces[0]!;
    const next = addDashboard(store, workspace.id, "Trading desk", {
      layout: "embed",
      dashboard: { title: "Trading", template: "trading-blotter" },
    });

    expect(next.workspaces[0]?.dashboards).toHaveLength(2);
    expect(getActiveDashboard(next).name).toBe("Trading desk");
  });

  it("migrates legacy single-spec localStorage", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
      removeItem: (key: string) => {
        memory.delete(key);
      },
    };

    memory.set(
      LEGACY_RUNTIME_SPEC_KEY,
      JSON.stringify({
        layout: "embed",
        dashboard: { title: "Legacy", template: "line-overview" },
      }),
    );

    const loaded = loadWorkspaceStore(storage, "test.workspaces", seedSpec);
    expect(memory.has(LEGACY_RUNTIME_SPEC_KEY)).toBe(false);
    expect(getActiveDashboard(loaded).specJson).toContain("line-overview");
  });

  it("selects dashboards within a workspace", () => {
    let store = createDefaultWorkspaceStore(seedSpec);
    const workspace = store.workspaces[0]!;
    store = addDashboard(store, workspace.id, "Second", seedSpec);
    const secondId = getActiveDashboard(store).id;
    const firstId = workspace.dashboards[0]!.id;

    store = selectDashboard(store, workspace.id, firstId);
    expect(getActiveDashboard(store).id).toBe(firstId);
    expect(secondId).not.toBe(firstId);
  });

  it("deletes dashboards but keeps at least one", () => {
    let store = createDefaultWorkspaceStore(seedSpec);
    const workspace = store.workspaces[0]!;
    store = addDashboard(store, workspace.id, "Second", seedSpec);
    const secondId = getActiveDashboard(store).id;

    store = deleteDashboard(store, workspace.id, secondId);
    expect(store.workspaces[0]?.dashboards).toHaveLength(1);

    const onlyId = store.workspaces[0]!.dashboards[0]!.id;
    const blocked = deleteDashboard(store, workspace.id, onlyId);
    expect(blocked.workspaces[0]?.dashboards).toHaveLength(1);
  });
});
