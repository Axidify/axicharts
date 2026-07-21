import { describe, expect, it } from "vitest";
import { getAgentSimulationSummaries } from "./agentIntegrator";

describe("getAgentSimulationSummaries", () => {
  it("returns zero silent_bad for all agent families", () => {
    const summaries = getAgentSimulationSummaries();
    expect(summaries).toHaveLength(3);
    for (const row of summaries) {
      expect(row.silent_bad, row.family).toBe(0);
      expect(row.works).toBeGreaterThan(0);
    }
    const cartesian = summaries.find((row) => row.family === "cartesian");
    expect(cartesian?.works).toBe(16);
    expect(cartesian?.throws).toBe(8);
  });
});
