import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { WorkspaceStore } from "@axicharts/charts-runtime/workspace";
import {
  createEmptyPersistence,
  type AxiboardPersistence,
  type RndSession,
  type RndSlug,
} from "./types";
import { isAxiboardPersistence } from "./validate";

const STATE_FILE = "state.json";

export function resolveDataDir(): string {
  const configured = process.env.AXIBOARD_DATA_DIR?.trim();
  if (configured) return path.resolve(configured);
  return path.resolve(process.cwd(), "data");
}

export class AxiboardFileStore {
  private state: AxiboardPersistence = createEmptyPersistence();
  private loaded = false;

  constructor(private readonly dataDir: string) {}

  private statePath(): string {
    return path.join(this.dataDir, STATE_FILE);
  }

  async load(): Promise<AxiboardPersistence> {
    if (this.loaded) return this.state;

    await mkdir(this.dataDir, { recursive: true });
    try {
      const raw = await readFile(this.statePath(), "utf8");
      const parsed = JSON.parse(raw) as unknown;
      if (isAxiboardPersistence(parsed)) {
        this.state = parsed;
      }
    } catch {
      this.state = createEmptyPersistence();
    }

    this.loaded = true;
    return this.state;
  }

  private async persist(): Promise<void> {
    await mkdir(this.dataDir, { recursive: true });
    const target = this.statePath();
    const temp = `${target}.${process.pid}.tmp`;
    await writeFile(temp, JSON.stringify(this.state, null, 2), "utf8");
    await rename(temp, target);
  }

  async getWorkspace(): Promise<WorkspaceStore | null> {
    const state = await this.load();
    return state.workspace ?? null;
  }

  async saveWorkspace(store: WorkspaceStore): Promise<void> {
    await this.load();
    this.state.workspace = store;
    await this.persist();
  }

  async getRndSession(slug: RndSlug): Promise<RndSession | null> {
    const state = await this.load();
    return state.rnd[slug] ?? null;
  }

  async saveRndSession(slug: RndSlug, session: RndSession): Promise<void> {
    await this.load();
    this.state.rnd[slug] = session;
    await this.persist();
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
