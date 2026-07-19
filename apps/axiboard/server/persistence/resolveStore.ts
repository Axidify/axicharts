import { loadAuthConfig } from "../auth/config";
import pg from "pg";
import { AxiboardFileStore, getFileStore, resolveDataDir } from "./fileStore";
import { AxiboardPostgresStore, createPostgresPool } from "./postgresStore";
import type { AxiboardWorkspaceStore } from "./store";
import { FileUserByokStore, type UserByokStore } from "./userByokStore";
import { PostgresUserByokStore } from "./postgresUserByokStore";

export function resolveDatabaseUrl(): string | null {
  const configured =
    process.env.AXIBOARD_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
  return configured || null;
}

let defaultWorkspaceStore: AxiboardWorkspaceStore | null = null;
let defaultByokStore: UserByokStore | null = null;
let postgresPool: pg.Pool | null = null;

export function getWorkspaceStore(options?: {
  dataDir?: string;
  databaseUrl?: string;
}): AxiboardWorkspaceStore {
  if (options?.databaseUrl !== undefined || options?.dataDir !== undefined) {
    const databaseUrl = options.databaseUrl ?? resolveDatabaseUrl();
    if (databaseUrl) return new AxiboardPostgresStore(createPostgresPool(databaseUrl));
    return options.dataDir ? new AxiboardFileStore(options.dataDir) : getFileStore();
  }

  if (defaultWorkspaceStore) return defaultWorkspaceStore;

  const databaseUrl = resolveDatabaseUrl();
  if (databaseUrl) {
    postgresPool = createPostgresPool(databaseUrl);
    defaultWorkspaceStore = new AxiboardPostgresStore(postgresPool);
    return defaultWorkspaceStore;
  }

  defaultWorkspaceStore = getFileStore();
  return defaultWorkspaceStore;
}

export function getUserByokStore(options?: {
  dataDir?: string;
  databaseUrl?: string;
}): UserByokStore | null {
  const auth = loadAuthConfig();
  if (!auth.enabled) return null;

  if (options?.databaseUrl !== undefined || options?.dataDir !== undefined) {
    const databaseUrl = options.databaseUrl ?? resolveDatabaseUrl();
    if (databaseUrl) {
      return new PostgresUserByokStore(createPostgresPool(databaseUrl), auth.secret);
    }
    const dataDir = options.dataDir ?? resolveDataDir();
    return new FileUserByokStore(dataDir, auth.secret);
  }

  if (defaultByokStore) return defaultByokStore;

  const databaseUrl = resolveDatabaseUrl();
  if (databaseUrl) {
    if (!postgresPool) postgresPool = createPostgresPool(databaseUrl);
    defaultByokStore = new PostgresUserByokStore(postgresPool, auth.secret);
    return defaultByokStore;
  }

  defaultByokStore = new FileUserByokStore(resolveDataDir(), auth.secret);
  return defaultByokStore;
}

export function resetWorkspaceStore(): void {
  defaultWorkspaceStore = null;
  defaultByokStore = null;
  postgresPool = null;
}
