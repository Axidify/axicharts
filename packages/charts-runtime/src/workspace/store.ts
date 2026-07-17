import { parseRuntimeSpec, serializeRuntimeSpec } from "../runtimeSpec";
import type { RuntimeDashboardSpec } from "../types";
import {
  DEFAULT_WORKSPACE_STORE_KEY,
  LEGACY_RUNTIME_SPEC_KEY,
  WORKSPACE_STORE_VERSION,
  type SavedDashboard,
  type Workspace,
  type WorkspaceStore,
} from "./types";

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createDefaultDashboard(
  name: string,
  spec: RuntimeDashboardSpec,
): SavedDashboard {
  return {
    id: createId("dash"),
    name,
    updatedAt: nowIso(),
    specJson: serializeRuntimeSpec(spec),
  };
}

export function createDefaultWorkspaceStore(
  seedSpec: RuntimeDashboardSpec,
): WorkspaceStore {
  const workspaceId = createId("ws");
  const dashboard = createDefaultDashboard("Ops overview", seedSpec);

  return {
    version: WORKSPACE_STORE_VERSION,
    activeWorkspaceId: workspaceId,
    activeDashboardId: dashboard.id,
    workspaces: [
      {
        id: workspaceId,
        name: "Default workspace",
        dashboards: [dashboard],
      },
    ],
  };
}

export function getActiveWorkspace(store: WorkspaceStore): Workspace {
  const workspace = store.workspaces.find((item) => item.id === store.activeWorkspaceId);
  if (!workspace) {
    throw new Error("Active workspace not found");
  }
  return workspace;
}

export function getActiveDashboard(store: WorkspaceStore): SavedDashboard {
  const workspace = getActiveWorkspace(store);
  const dashboard = workspace.dashboards.find(
    (item) => item.id === store.activeDashboardId,
  );
  if (!dashboard) {
    throw new Error("Active dashboard not found");
  }
  return dashboard;
}

export function parseDashboardSpec(dashboard: SavedDashboard): RuntimeDashboardSpec {
  return parseRuntimeSpec(dashboard.specJson);
}

export function selectWorkspace(store: WorkspaceStore, workspaceId: string): WorkspaceStore {
  const workspace = store.workspaces.find((item) => item.id === workspaceId);
  if (!workspace) return store;
  const dashboard = workspace.dashboards[0];
  if (!dashboard) return store;

  return {
    ...store,
    activeWorkspaceId: workspaceId,
    activeDashboardId: dashboard.id,
  };
}

export function selectDashboard(
  store: WorkspaceStore,
  workspaceId: string,
  dashboardId: string,
): WorkspaceStore {
  const workspace = store.workspaces.find((item) => item.id === workspaceId);
  if (!workspace?.dashboards.some((item) => item.id === dashboardId)) {
    return store;
  }

  return {
    ...store,
    activeWorkspaceId: workspaceId,
    activeDashboardId: dashboardId,
  };
}

export function addWorkspace(
  store: WorkspaceStore,
  name: string,
  seedSpec: RuntimeDashboardSpec,
): WorkspaceStore {
  const workspaceId = createId("ws");
  const dashboard = createDefaultDashboard("Untitled dashboard", seedSpec);
  const workspace: Workspace = {
    id: workspaceId,
    name,
    dashboards: [dashboard],
  };
  return {
    ...store,
    workspaces: [...store.workspaces, workspace],
    activeWorkspaceId: workspaceId,
    activeDashboardId: dashboard.id,
  };
}

export function addDashboard(
  store: WorkspaceStore,
  workspaceId: string,
  name: string,
  spec: RuntimeDashboardSpec,
): WorkspaceStore {
  const dashboard = createDefaultDashboard(name, spec);
  const workspaces = store.workspaces.map((workspace) =>
    workspace.id === workspaceId
      ? { ...workspace, dashboards: [...workspace.dashboards, dashboard] }
      : workspace,
  );

  return {
    ...store,
    workspaces,
    activeWorkspaceId: workspaceId,
    activeDashboardId: dashboard.id,
  };
}

export function saveDashboardSpec(
  store: WorkspaceStore,
  workspaceId: string,
  dashboardId: string,
  spec: RuntimeDashboardSpec,
  options?: {
    name?: string;
    meta?: SavedDashboard["meta"];
  },
): WorkspaceStore {
  const specJson = serializeRuntimeSpec(spec);

  const workspaces = store.workspaces.map((workspace) => {
    if (workspace.id !== workspaceId) return workspace;

    return {
      ...workspace,
      dashboards: workspace.dashboards.map((dashboard) =>
        dashboard.id === dashboardId
          ? {
              ...dashboard,
              name: options?.name ?? dashboard.name,
              specJson,
              meta: options?.meta ?? dashboard.meta,
              updatedAt: nowIso(),
            }
          : dashboard,
      ),
    };
  });

  return { ...store, workspaces };
}

export function renameDashboard(
  store: WorkspaceStore,
  workspaceId: string,
  dashboardId: string,
  name: string,
): WorkspaceStore {
  const workspaces = store.workspaces.map((workspace) => {
    if (workspace.id !== workspaceId) return workspace;

    return {
      ...workspace,
      dashboards: workspace.dashboards.map((dashboard) =>
        dashboard.id === dashboardId ? { ...dashboard, name } : dashboard,
      ),
    };
  });

  return { ...store, workspaces };
}

export function deleteDashboard(
  store: WorkspaceStore,
  workspaceId: string,
  dashboardId: string,
): WorkspaceStore {
  const workspace = store.workspaces.find((item) => item.id === workspaceId);
  if (!workspace || workspace.dashboards.length <= 1) {
    return store;
  }

  const workspaces = store.workspaces.map((item) => {
    if (item.id !== workspaceId) return item;
    return {
      ...item,
      dashboards: item.dashboards.filter((dashboard) => dashboard.id !== dashboardId),
    };
  });

  const nextWorkspace = workspaces.find((item) => item.id === workspaceId);
  const nextDashboardId = nextWorkspace?.dashboards[0]?.id ?? "";

  return {
    ...store,
    workspaces,
    activeDashboardId:
      store.activeDashboardId === dashboardId ? nextDashboardId : store.activeDashboardId,
  };
}

export function renameWorkspace(
  store: WorkspaceStore,
  workspaceId: string,
  name: string,
): WorkspaceStore {
  const workspaces = store.workspaces.map((workspace) =>
    workspace.id === workspaceId ? { ...workspace, name } : workspace,
  );
  return { ...store, workspaces };
}

export function importSharedWorkspace(
  store: WorkspaceStore,
  payload: {
    name: string;
    dashboards: Array<{
      name: string;
      meta?: SavedDashboard["meta"];
      spec: RuntimeDashboardSpec;
    }>;
  },
): WorkspaceStore {
  if (payload.dashboards.length === 0) {
    throw new Error("Workspace import requires at least one dashboard");
  }

  const workspaceId = createId("ws");
  const dashboards = payload.dashboards.map((item) => ({
    id: createId("dash"),
    name: item.name,
    updatedAt: nowIso(),
    specJson: serializeRuntimeSpec(item.spec),
    meta: item.meta,
  }));

  return {
    ...store,
    workspaces: [
      ...store.workspaces,
      {
        id: workspaceId,
        name: payload.name,
        dashboards,
      },
    ],
    activeWorkspaceId: workspaceId,
    activeDashboardId: dashboards[0]!.id,
  };
}

export function loadWorkspaceStore(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  storageKey = DEFAULT_WORKSPACE_STORE_KEY,
  seedSpec: RuntimeDashboardSpec,
): WorkspaceStore {
  const raw = storage.getItem(storageKey);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as WorkspaceStore;
      if (parsed.version === WORKSPACE_STORE_VERSION && parsed.workspaces.length > 0) {
        return parsed;
      }
    } catch {
      storage.removeItem(storageKey);
    }
  }

  const legacy = storage.getItem(LEGACY_RUNTIME_SPEC_KEY);
  let store = createDefaultWorkspaceStore(seedSpec);

  if (legacy) {
    try {
      const spec = parseRuntimeSpec(legacy);
      const workspace = store.workspaces[0]!;
      const dashboard = workspace.dashboards[0]!;
      store = saveDashboardSpec(store, workspace.id, dashboard.id, spec, {
        name: "Imported dashboard",
      });
      storage.removeItem(LEGACY_RUNTIME_SPEC_KEY);
    } catch {
      storage.removeItem(LEGACY_RUNTIME_SPEC_KEY);
    }
  }

  persistWorkspaceStore(storage, store, storageKey);
  return store;
}

export function persistWorkspaceStore(
  storage: Pick<Storage, "setItem">,
  store: WorkspaceStore,
  storageKey = DEFAULT_WORKSPACE_STORE_KEY,
): void {
  storage.setItem(storageKey, JSON.stringify(store));
}
