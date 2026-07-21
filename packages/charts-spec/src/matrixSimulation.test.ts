import { describe, expect, it } from "vitest";
import {
  runMatrixSimulations,
  summarizeSimulations,
} from "./matrixSimulation";

describe("matrix simulation (RFC-004 C188)", () => {
  const results = runMatrixSimulations();
  const summary = summarizeSimulations(results);

  it("runs all scenarios", () => {
    expect(results.length).toBeGreaterThanOrEqual(8);
  });

  it("canonical matrix combos work", () => {
    for (const id of ["M01", "M02"]) {
      const result = results.find((entry) => entry.id === id)!;
      expect(result.outcome, `${id}: ${result.details}`).toBe("works");
    }
  });

  it("validation gates invalid specs", () => {
    for (const id of ["M03", "M04", "M05", "M06", "M07", "M08"]) {
      const result = results.find((entry) => entry.id === id)!;
      expect(result.outcome, `${id}: ${result.details}`).toBe("throws");
    }
  });

  it("keeps silent_bad at zero", () => {
    expect(summary.silent_bad, JSON.stringify(summary.gaps, null, 2)).toBe(0);
  });
});
