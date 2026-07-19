import type { ByokConfig } from "../types";
import type { UserByokStore } from "./userByokStore";
import { decrypt, encrypt } from "./userByokStore";
import pg from "pg";

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS axiboard_user_byok (
  user_id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

export class PostgresUserByokStore implements UserByokStore {
  private initialized = false;

  constructor(
    private readonly pool: pg.Pool,
    private readonly secret: string,
  ) {}

  private async ensureSchema(): Promise<void> {
    if (this.initialized) return;
    await this.pool.query(INIT_SQL);
    this.initialized = true;
  }

  async getByok(userId: string): Promise<ByokConfig | null> {
    await this.ensureSchema();
    const result = await this.pool.query<{ payload: string }>(
      "SELECT payload FROM axiboard_user_byok WHERE user_id = $1",
      [userId],
    );
    const row = result.rows[0];
    if (!row) return null;
    return decrypt<ByokConfig>(this.secret, row.payload);
  }

  async saveByok(userId: string, byok: ByokConfig): Promise<void> {
    await this.ensureSchema();
    await this.pool.query(
      `INSERT INTO axiboard_user_byok (user_id, payload, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (user_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()`,
      [userId, encrypt(this.secret, byok)],
    );
  }
}
