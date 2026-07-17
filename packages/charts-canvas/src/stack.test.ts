import { describe, expect, it } from "vitest";
import { shouldStackSeries } from "./stack";

describe("shouldStackSeries", () => {
  it("returns false when stacked is off", () => {
    expect(shouldStackSeries(false, 3)).toBe(false);
    expect(shouldStackSeries(undefined, 3)).toBe(false);
  });

  it("returns false for a single series", () => {
    expect(shouldStackSeries(true, 1)).toBe(false);
  });

  it("returns true for multi-series stacked charts", () => {
    expect(shouldStackSeries(true, 2)).toBe(true);
    expect(shouldStackSeries(true, 4)).toBe(true);
  });
});
