import type { WorkspaceStore } from "@axicharts/charts-runtime/workspace";

export const PERSISTENCE_VERSION = 1 as const;

export type AxiboardPersistence = {
  version: typeof PERSISTENCE_VERSION;
  workspace?: WorkspaceStore;
};

export function createEmptyPersistence(): AxiboardPersistence {
  return { version: PERSISTENCE_VERSION };
}
