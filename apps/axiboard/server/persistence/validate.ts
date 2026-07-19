import { WORKSPACE_STORE_VERSION } from "@axicharts/charts-runtime/workspace";
import type { WorkspaceStore } from "@axicharts/charts-runtime/workspace";
import type { AxiboardPersistence } from "./types";
import { PERSISTENCE_VERSION } from "./types";

export function isWorkspaceStore(value: unknown): value is WorkspaceStore {
  if (!value || typeof value !== "object") return false;
  const store = value as WorkspaceStore;
  if (store.version !== WORKSPACE_STORE_VERSION) return false;
  if (!Array.isArray(store.workspaces) || store.workspaces.length === 0) return false;
  if (typeof store.activeWorkspaceId !== "string") return false;
  if (typeof store.activeDashboardId !== "string") return false;
  return true;
}

export function isAxiboardPersistence(value: unknown): value is AxiboardPersistence {
  if (!value || typeof value !== "object") return false;
  const state = value as AxiboardPersistence & { rnd?: unknown };
  if (state.version !== PERSISTENCE_VERSION) return false;
  if (state.workspace != null && !isWorkspaceStore(state.workspace)) return false;
  return true;
}
