import { WORKSPACE_STORE_VERSION } from "@axicharts/charts-runtime/workspace";
import type { WorkspaceStore } from "@axicharts/charts-runtime/workspace";
import { describe, expect, it } from "vitest";
import { AxiboardPostgresStore, createPostgresPool } from "./postgresStore";

function sampleWorkspace(): WorkspaceStore {
  return {
    version: WORKSPACE_STORE_VERSION,
    activeWorkspaceId: "ws-1",
    activeDashboardId: "dash-1",
    workspaces: [
      {
        id: "ws-1",
        name: "Postgres workspace",
        dashboards: [
          {
            id: "dash-1",
            name: "Dashboard",
            updatedAt: "2026-07-19T00:00:00.000Z",
            specJson: "{}",
          },
        ],
      },
    ],
  };
}

const databaseUrl = process.env.AXIBOARD_DATABASE_URL?.trim();

describe.skipIf(!databaseUrl)("AxiboardPostgresStore", () => {
  it("persists workspace to Postgres", async () => {
    const pool = createPostgresPool(databaseUrl!);
    const store = new AxiboardPostgresStore(pool);
    const workspace = sampleWorkspace();

    try {
      await store.saveWorkspace(workspace);
      await expect(store.getWorkspace()).resolves.toEqual(workspace);
    } finally {
      await pool.query("DELETE FROM axiboard_workspace WHERE id = 'default'");
      await store.close();
    }
  });
});
