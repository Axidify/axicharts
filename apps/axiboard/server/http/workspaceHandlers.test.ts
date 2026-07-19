import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { WORKSPACE_STORE_VERSION } from "@axicharts/charts-runtime/workspace";
import type { WorkspaceStore } from "@axicharts/charts-runtime/workspace";
import { describe, expect, it } from "vitest";
import { createAxiboardServer } from "../createServer";
import { AxiboardFileStore } from "../persistence/fileStore";

function sampleWorkspace(): WorkspaceStore {
  return {
    version: WORKSPACE_STORE_VERSION,
    activeWorkspaceId: "ws-1",
    activeDashboardId: "dash-1",
    workspaces: [
      {
        id: "ws-1",
        name: "Persisted",
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

describe("C163 workspace persistence API", () => {
  it("GET/POST /api/workspaces", async () => {
    const staticDir = await mkdtemp(path.join(os.tmpdir(), "axiboard-static-"));
    const dataDir = await mkdtemp(path.join(os.tmpdir(), "axiboard-data-"));
    await writeFile(
      path.join(staticDir, "index.html"),
      "<!DOCTYPE html><html><body>axiboard</body></html>",
    );

    const fileStore = new AxiboardFileStore(dataDir);
    const { listen, server } = createAxiboardServer({
      port: 0,
      host: "127.0.0.1",
      staticDir,
      fileStore,
    });

    await listen();
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const base = `http://127.0.0.1:${port}`;

    try {
      const empty = await fetch(`${base}/api/workspaces`);
      expect(empty.status).toBe(200);
      expect(await empty.json()).toEqual({ ok: true, store: null });

      const workspace = sampleWorkspace();
      const save = await fetch(`${base}/api/workspaces`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ store: workspace }),
      });
      expect(save.status).toBe(200);
      expect(await save.json()).toEqual({ ok: true });

      const loaded = await fetch(`${base}/api/workspaces`);
      expect(await loaded.json()).toEqual({ ok: true, store: workspace });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
