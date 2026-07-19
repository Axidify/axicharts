import { describe, expect, it } from "vitest";
import { isFlatZeroSeries } from "./cartesianPointerChartProps";

describe("isFlatZeroSeries", () => {
  it("detects all-zero series", () => {
    expect(isFlatZeroSeries([{ name: "A", data: [0, 0, 0] }])).toBe(true);
  });

  it("returns false when any value is non-zero", () => {
    expect(isFlatZeroSeries([{ name: "A", data: [0, 1, 0] }])).toBe(false);
  });
});
