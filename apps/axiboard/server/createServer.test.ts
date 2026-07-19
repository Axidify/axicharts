import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createAxiboardServer } from "./createServer";

describe("C162 production server", () => {
  it("serves orchestrator health and static SPA", async () => {
    const staticDir = await mkdtemp(path.join(os.tmpdir(), "axiboard-static-"));
    await writeFile(
      path.join(staticDir, "index.html"),
      "<!DOCTYPE html><html><body>axiboard</body></html>",
    );

    const { listen, url, server } = createAxiboardServer({
      port: 0,
      host: "127.0.0.1",
      staticDir,
    });

    await listen();
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const base = `http://127.0.0.1:${port}`;

    try {
      const health = await fetch(`${base}/api/orchestrator/health`);
      expect(health.status).toBe(200);
      expect(await health.json()).toEqual({ ok: true, service: "axiboard-orchestrator" });

      const home = await fetch(base);
      expect(home.status).toBe(200);
      expect(await home.text()).toContain("axiboard");

      const spa = await fetch(`${base}/rnd/ledger`);
      expect(spa.status).toBe(200);
      expect(await spa.text()).toContain("axiboard");
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }

    expect(url).toBeTruthy();
  });
});
