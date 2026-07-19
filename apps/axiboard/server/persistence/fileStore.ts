import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { WorkspaceStore } from "@axicharts/charts-runtime/workspace";
import { getDefaultUserId } from "../auth/config";
import { createEmptyPersistence, type AxiboardPersistence } from "./types";
import { isAxiboardPersistence } from "./validate";
import type { AxiboardWorkspaceStore } from "./store";

const STATE_FILE = "state.json";
const LEGACY_STATE_FILE = "state.json";

export function resolveDataDir(): string {
  const configured = process.env.AXIBOARD_DATA_DIR?.trim();
  if (configured) return path.resolve(configured);
  return path.resolve(process.cwd(), "data");
}

function safeUserId(userId: string): string {
  return userId.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export class AxiboardFileStore implements AxiboardWorkspaceStore {
  private cache = new Map<string, AxiboardPersistence>();
  private loaded = new Set<string>();

  constructor(private readonly dataDir: string) {}

  private statePath(userId: string): string {
    return path.join(this.dataDir, "users", safeUserId(userId), STATE_FILE);
  }

  private async load(userId: string): Promise<AxiboardPersistence> {
    if (this.loaded.has(userId)) {
      return this.cache.get(userId) ?? createEmptyPersistence();
    }

    const statePath = this.statePath(userId);
    await mkdir(path.dirname(statePath), { recursive: true });
    let state = createEmptyPersistence();
    try {
      const raw = await readFile(statePath, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      if (isAxiboardPersistence(parsed)) {
        state = parsed;
      }
    } catch {
      if (userId === getDefaultUserId()) {
        state = await this.loadLegacyState();
      }
    }

    this.cache.set(userId, state);
    this.loaded.add(userId);
    return state;
  }

  private async loadLegacyState(): Promise<AxiboardPersistence> {
    try {
      const raw = await readFile(path.join(this.dataDir, LEGACY_STATE_FILE), "utf8");
      const parsed = JSON.parse(raw) as unknown;
      if (isAxiboardPersistence(parsed)) return parsed;
    } catch {
      // no legacy file
    }
    return createEmptyPersistence();
  }

  private async persist(userId: string): Promise<void> {
    const state = await this.load(userId);
    const target = this.statePath(userId);
    const temp = `${target}.${process.pid}.tmp`;
    await writeFile(temp, JSON.stringify(state, null, 2), "utf8");
    await rename(temp, target);
  }

  async getWorkspace(userId: string): Promise<WorkspaceStore | null> {
    const state = await this.load(userId);
    return state.workspace ?? null;
  }

  async saveWorkspace(userId: string, store: WorkspaceStore): Promise<void> {
    const state = await this.load(userId);
    state.workspace = store;
    this.cache.set(userId, state);
    await this.persist(userId);
  }
}

let defaultStore: AxiboardFileStore | null = null;

export function getFileStore(dataDir?: string): AxiboardFileStore {
  if (dataDir) return new AxiboardFileStore(dataDir);
  if (!defaultStore) defaultStore = new AxiboardFileStore(resolveDataDir());
  return defaultStore;
}

export function resetFileStore(): void {
  defaultStore = null;
}
