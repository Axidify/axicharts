import { describe, expect, it } from "vitest";
import { sliceHeatmapByBrushRange } from "./EChartsHeatmap";

describe("sliceHeatmapByBrushRange", () => {
  const matrix = {
    xCategories: ["A", "B", "C", "D"],
    yCategories: ["Y1", "Y2"],
    values: [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
    ],
  };

  it("returns the original matrix when range is null", () => {
    expect(sliceHeatmapByBrushRange(matrix, null)).toEqual(matrix);
  });

  it("slices x categories and value columns by brush percent", () => {
    const sliced = sliceHeatmapByBrushRange(matrix, { start: 25, end: 75 });
    expect(sliced.xCategories).toEqual(["B", "C"]);
    expect(sliced.yCategories).toEqual(["Y1", "Y2"]);
    expect(sliced.values).toEqual([
      [2, 3],
      [6, 7],
    ]);
  });
});
