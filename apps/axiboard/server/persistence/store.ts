import type { WorkspaceStore } from "@axicharts/charts-runtime/workspace";

/** Workspace persistence backend (file or Postgres). */
export type AxiboardWorkspaceStore = {
  getWorkspace(): Promise<WorkspaceStore | null>;
  saveWorkspace(store: WorkspaceStore): Promise<void>;
};
