import type { WorkspaceStore } from "@axicharts/charts-runtime/workspace";
import type { Persona } from "@axicharts/charts-spec";
import type { OrchestratorChatResult } from "../types";

export const PERSISTENCE_VERSION = 1 as const;

export type RndSlug = "tabular" | "ledger" | "sales" | "attendance";

export type RndSession = {
  csv: string;
  persona: Persona;
  followUpIntents: string[];
  lastResult?: OrchestratorChatResult;
  updatedAt: string;
};

export type AxiboardPersistence = {
  version: typeof PERSISTENCE_VERSION;
  workspace?: WorkspaceStore;
  rnd: Partial<Record<RndSlug, RndSession>>;
};

export function createEmptyPersistence(): AxiboardPersistence {
  return { version: PERSISTENCE_VERSION, rnd: {} };
}
