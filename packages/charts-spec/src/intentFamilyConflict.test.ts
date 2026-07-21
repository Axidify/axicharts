import { describe, expect, it } from "vitest";
import {
  detectIntentFamilyConflict,
  intentAgentFamilies,
} from "./intentFamilyConflict";

describe("intentFamilyConflict", () => {
  it("detects bar + pie contradictions", () => {
    const intent = "bar chart and also pie chart of revenue by month";
    expect(intentAgentFamilies(intent)).toEqual(
      expect.arrayContaining(["cartesian", "distribution"]),
    );
    expect(detectIntentFamilyConflict(intent)).toBe(true);
  });

  it("does not flag single-family cartesian intents", () => {
    expect(detectIntentFamilyConflict("bar chart of revenue by month")).toBe(false);
    expect(detectIntentFamilyConflict("line chart of revenue over time")).toBe(false);
  });

  it("does not flag generic breakdown vocabulary without chart types", () => {
    expect(detectIntentFamilyConflict("revenue breakdown by month")).toBe(false);
  });

  it("detects bar + heatmap contradictions", () => {
    const intent = "bar chart and heatmap of latency by hour and day";
    expect(intentAgentFamilies(intent)).toEqual(
      expect.arrayContaining(["cartesian", "matrix"]),
    );
    expect(detectIntentFamilyConflict(intent)).toBe(true);
  });
});
