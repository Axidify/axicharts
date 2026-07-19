import type { WorkspaceStore } from "@axicharts/charts-runtime/workspace";

/** Workspace persistence backend (file or Postgres), scoped per user id. */
export type AxiboardWorkspaceStore = {
  getWorkspace(userId: string): Promise<WorkspaceStore | null>;
  saveWorkspace(userId: string, store: WorkspaceStore): Promise<void>;
};
