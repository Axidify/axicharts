import { describe, expect, it } from "vitest";
import { lineSeriesPaths, resolveLineCurve } from "./linePaths";

describe("linePaths", () => {
  it("returns undefined for linear (uPlot default)", () => {
    expect(lineSeriesPaths("linear")).toBeUndefined();
  });

  it("returns a path builder for monotone curves", () => {
    expect(typeof lineSeriesPaths("monotone")).toBe("function");
  });

  it("prefers chart-level curve override over theme", () => {
    expect(resolveLineCurve("monotone", "linear")).toBe("linear");
    expect(resolveLineCurve("linear")).toBe("linear");
  });
});
