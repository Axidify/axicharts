import { WORKSPACE_STORE_VERSION } from "@axicharts/charts-runtime/workspace";
import type { WorkspaceStore } from "@axicharts/charts-runtime/workspace";
import type { AxiboardPersistence, RndSession, RndSlug } from "./types";
import { PERSISTENCE_VERSION } from "./types";

const RND_SLUGS = new Set<RndSlug>(["tabular", "ledger", "sales", "attendance"]);

export function isRndSlug(value: string): value is RndSlug {
  return RND_SLUGS.has(value as RndSlug);
}

export function isWorkspaceStore(value: unknown): value is WorkspaceStore {
  if (!value || typeof value !== "object") return false;
  const store = value as WorkspaceStore;
  if (store.version !== WORKSPACE_STORE_VERSION) return false;
  if (!Array.isArray(store.workspaces) || store.workspaces.length === 0) return false;
  if (typeof store.activeWorkspaceId !== "string") return false;
  if (typeof store.activeDashboardId !== "string") return false;
  return true;
}

export function isRndSession(value: unknown): value is RndSession {
  if (!value || typeof value !== "object") return false;
  const session = value as RndSession;
  if (typeof session.csv !== "string") return false;
  if (typeof session.persona !== "string") return false;
  if (!Array.isArray(session.followUpIntents)) return false;
  if (typeof session.updatedAt !== "string") return false;
  return true;
}

export function isAxiboardPersistence(value: unknown): value is AxiboardPersistence {
  if (!value || typeof value !== "object") return false;
  const state = value as AxiboardPersistence;
  if (state.version !== PERSISTENCE_VERSION) return false;
  if (state.workspace != null && !isWorkspaceStore(state.workspace)) return false;
  if (!state.rnd || typeof state.rnd !== "object") return false;
  for (const [slug, session] of Object.entries(state.rnd)) {
    if (!isRndSlug(slug) || !isRndSession(session)) return false;
  }
  return true;
}
