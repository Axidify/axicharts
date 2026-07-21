import { describe, expect, it } from "vitest";
import { createPlannerServer } from "./server";

const profile = {
  metrics: [{ name: "cpu", unit: "%", tags: { vertical: "ops" } }],
};

describe("planner server agent guard", () => {
  it("rejects agent=true requests with LEGACY_PLANNER_NOT_AGENT_SAFE", async () => {
    const { server, listen } = createPlannerServer({ port: 0, host: "127.0.0.1" });
    await listen();
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("expected server address");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/plan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profile, intent: "ops overview", agent: true }),
    });
    const payload = (await response.json()) as { code?: string };
    expect(response.status).toBe(400);
    expect(payload.code).toBe("LEGACY_PLANNER_NOT_AGENT_SAFE");

    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });
});
