import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createAxiboardServer } from "../createServer";
import { AxiboardFileStore } from "../persistence/fileStore";

describe("C169 auth + scoped workspaces", () => {
  const previousEnv = { ...process.env };

  beforeEach(() => {
    process.env.AXIBOARD_AUTH_SECRET = "integration-test-secret-32chars";
    process.env.AXIBOARD_AUTH_TOKENS = "alice:alice-token,bob:bob-token";
    process.env.AXIBOARD_AUTH_ENABLED = "true";
  });

  afterEach(() => {
    process.env = { ...previousEnv };
  });

  it("isolates workspace data per authenticated user", async () => {
    const staticDir = await mkdtemp(path.join(os.tmpdir(), "axiboard-static-"));
    const dataDir = await mkdtemp(path.join(os.tmpdir(), "axiboard-data-"));
    await writeFile(
      path.join(staticDir, "index.html"),
      "<!DOCTYPE html><html><body>axiboard</body></html>",
    );

    const workspaceStore = new AxiboardFileStore(dataDir);
    const { listen, server } = createAxiboardServer({
      port: 0,
      host: "127.0.0.1",
      staticDir,
      workspaceStore,
    });

    await listen();
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const base = `http://127.0.0.1:${port}`;

    try {
      const unauth = await fetch(`${base}/api/workspaces`);
      expect(unauth.status).toBe(401);

      const login = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: "alice-token" }),
      });
      expect(login.status).toBe(200);
      const cookie = login.headers.get("set-cookie");
      expect(cookie).toContain("axiboard-auth=");

      const saveAlice = await fetch(`${base}/api/workspaces`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookie ?? "",
        },
        body: JSON.stringify({
          store: {
            version: 1,
            activeWorkspaceId: "ws-alice",
            activeDashboardId: "dash-alice",
            workspaces: [
              {
                id: "ws-alice",
                name: "Alice workspace",
                dashboards: [
                  {
                    id: "dash-alice",
                    name: "Dashboard",
                    updatedAt: "2026-07-19T00:00:00.000Z",
                    specJson: "{}",
                  },
                ],
              },
            ],
          },
        }),
      });
      expect(saveAlice.status).toBe(200);

      const loadAlice = await fetch(`${base}/api/workspaces`, {
        headers: { cookie: cookie ?? "" },
      });
      const alicePayload = (await loadAlice.json()) as { store: { workspaces: Array<{ name: string }> } };
      expect(alicePayload.store.workspaces[0]?.name).toBe("Alice workspace");

      const bobLogin = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: "bob-token" }),
      });
      const bobCookie = bobLogin.headers.get("set-cookie");
      const loadBob = await fetch(`${base}/api/workspaces`, {
        headers: { cookie: bobCookie ?? "" },
      });
      const bobPayload = (await loadBob.json()) as { store: unknown };
      expect(bobPayload.store).toBeNull();
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
