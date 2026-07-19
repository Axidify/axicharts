import { AxiboardFileStore, getFileStore, resolveDataDir } from "./fileStore";
import { AxiboardPostgresStore, createPostgresPool } from "./postgresStore";
import type { AxiboardWorkspaceStore } from "./store";

export function resolveDatabaseUrl(): string | null {
  const configured =
    process.env.AXIBOARD_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
  return configured || null;
}

let defaultStore: AxiboardWorkspaceStore | null = null;
let postgresStore: AxiboardPostgresStore | null = null;

export function getWorkspaceStore(options?: {
  dataDir?: string;
  databaseUrl?: string;
}): AxiboardWorkspaceStore {
  if (options?.databaseUrl !== undefined || options?.dataDir !== undefined) {
    const databaseUrl = options.databaseUrl ?? resolveDatabaseUrl();
    if (databaseUrl) return new AxiboardPostgresStore(createPostgresPool(databaseUrl));
    return options.dataDir ? new AxiboardFileStore(options.dataDir) : getFileStore();
  }

  if (defaultStore) return defaultStore;

  const databaseUrl = resolveDatabaseUrl();
  if (databaseUrl) {
    postgresStore = new AxiboardPostgresStore(createPostgresPool(databaseUrl));
    defaultStore = postgresStore;
    return defaultStore;
  }

  defaultStore = getFileStore();
  return defaultStore;
}

export function resetWorkspaceStore(): void {
  defaultStore = null;
  postgresStore = null;
}
