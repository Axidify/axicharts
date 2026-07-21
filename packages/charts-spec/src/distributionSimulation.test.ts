import { describe, expect, it } from "vitest";
import {
  runDistributionSimulations,
  summarizeSimulations,
} from "./distributionSimulation";

describe("distribution simulation (RFC-004 C185)", () => {
  const results = runDistributionSimulations();
  const summary = summarizeSimulations(results);

  it("runs all scenarios", () => {
    expect(results.length).toBeGreaterThanOrEqual(10);
  });

  it("canonical distribution combos work", () => {
    for (const id of ["D01", "D02", "D03", "D05", "D13"]) {
      const result = results.find((entry) => entry.id === id)!;
      expect(result.outcome, `${id}: ${result.details}`).toBe("works");
    }
  });

  it("validation gates invalid specs", () => {
    for (const id of ["D06", "D07", "D08", "D10", "D11", "D12"]) {
      const result = results.find((entry) => entry.id === id)!;
      expect(result.outcome, `${id}: ${result.details}`).toBe("throws");
    }
  });

  it("keeps silent_bad at zero", () => {
    expect(summary.silent_bad, JSON.stringify(summary.gaps, null, 2)).toBe(0);
  });
});
