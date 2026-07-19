import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { WORKSPACE_STORE_VERSION } from "@axicharts/charts-runtime/workspace";
import type { WorkspaceStore } from "@axicharts/charts-runtime/workspace";
import { describe, expect, it } from "vitest";
import { AxiboardFileStore } from "./fileStore";

function sampleWorkspace(): WorkspaceStore {
  return {
    version: WORKSPACE_STORE_VERSION,
    activeWorkspaceId: "ws-1",
    activeDashboardId: "dash-1",
    workspaces: [
      {
        id: "ws-1",
        name: "Test workspace",
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

describe("AxiboardFileStore", () => {
  it("persists workspace to disk", async () => {
    const dataDir = await mkdtemp(path.join(os.tmpdir(), "axiboard-data-"));
    const store = new AxiboardFileStore(dataDir);
    const workspace = sampleWorkspace();

    await store.saveWorkspace("default", workspace);
    await expect(store.getWorkspace("default")).resolves.toEqual(workspace);

    const reloaded = new AxiboardFileStore(dataDir);
    await expect(reloaded.getWorkspace("default")).resolves.toEqual(workspace);
  });
});
