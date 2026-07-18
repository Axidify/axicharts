import { describe, expect, it } from "vitest";
import { computeValueExtents, linePath, plotRect, yAt } from "./scales";

describe("svg scales", () => {
  it("builds a line path across the plot area", () => {
    const plot = plotRect(200, 100);
    const path = linePath([10, 20, 15], 0, 20, plot);
    expect(path.startsWith("M")).toBe(true);
    expect(path).toContain("L");
  });

  it("computes stacked extents from zero", () => {
    const extents = computeValueExtents(
      [
        { name: "a", data: [1, 2] },
        { name: "b", data: [3, 4] },
      ],
      true,
    );
    expect(extents.min).toBe(0);
    expect(extents.max).toBe(6);
  });

  it("maps values to y coordinates inside the plot", () => {
    const plot = plotRect(120, 80);
    expect(yAt(0, 0, 10, plot)).toBeGreaterThan(yAt(10, 0, 10, plot));
  });
});
