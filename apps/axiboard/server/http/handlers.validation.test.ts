import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createAxiboardServer } from "../createServer";
import { AxiboardFileStore } from "../persistence/fileStore";

describe("orchestrator HTTP validation", () => {
  it("returns 400 for invalid plan body", async () => {
    const staticDir = await mkdtemp(path.join(os.tmpdir(), "axiboard-static-"));
    await writeFile(
      path.join(staticDir, "index.html"),
      "<!DOCTYPE html><html><body>axiboard</body></html>",
    );

    const { listen, server } = createAxiboardServer({
      port: 0,
      host: "127.0.0.1",
      staticDir,
      workspaceStore: new AxiboardFileStore(await mkdtemp(path.join(os.tmpdir(), "axiboard-data-"))),
    });

    await listen();
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const base = `http://127.0.0.1:${port}`;

    try {
      const response = await fetch(`${base}/api/orchestrator/plan`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ persona: "manager" }),
      });
      expect(response.status).toBe(400);
      const payload = (await response.json()) as { ok: boolean; error: string };
      expect(payload.ok).toBe(false);
      expect(payload.error).toMatch(/csv or rows required/i);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
