import type { WorkspaceStore } from "@axicharts/charts-runtime/workspace";
import pg from "pg";
import type { AxiboardWorkspaceStore } from "./store";
import { isWorkspaceStore } from "./validate";

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS axiboard_workspace (
  id TEXT PRIMARY KEY,
  store JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

export class AxiboardPostgresStore implements AxiboardWorkspaceStore {
  private initialized = false;

  constructor(private readonly pool: pg.Pool) {}

  private async ensureSchema(): Promise<void> {
    if (this.initialized) return;
    await this.pool.query(INIT_SQL);
    this.initialized = true;
  }

  async getWorkspace(userId: string): Promise<WorkspaceStore | null> {
    await this.ensureSchema();
    const result = await this.pool.query<{ store: unknown }>(
      "SELECT store FROM axiboard_workspace WHERE id = $1",
      [userId],
    );
    const row = result.rows[0];
    if (!row) return null;
    if (!isWorkspaceStore(row.store)) return null;
    return row.store;
  }

  async saveWorkspace(userId: string, store: WorkspaceStore): Promise<void> {
    await this.ensureSchema();
    await this.pool.query(
      `INSERT INTO axiboard_workspace (id, store, updated_at)
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT (id) DO UPDATE SET store = EXCLUDED.store, updated_at = now()`,
      [userId, JSON.stringify(store)],
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export function createPostgresPool(connectionString: string): pg.Pool {
  return new pg.Pool({ connectionString });
}
