import { describe, expect, it } from "vitest";
import { sliceCartesianByBrushRange, mapSyncIndexForBrushRange } from "./brushRange";

describe("sliceCartesianByBrushRange", () => {
  const categories = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
  const series = [{ name: "RSI", data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }];

  it("returns the original data when range is null", () => {
    const sliced = sliceCartesianByBrushRange(categories, series, null);
    expect(sliced.categories).toEqual(categories);
    expect(sliced.series[0]?.data).toEqual(series[0]?.data);
  });

  it("slices categories and series by percentage window", () => {
    const sliced = sliceCartesianByBrushRange(categories, series, {
      start: 0,
      end: 45,
    });

    expect(sliced.categories).toEqual(["a", "b", "c", "d", "e"]);
    expect(sliced.series[0]?.data).toEqual([1, 2, 3, 4, 5]);
  });

  it("maps sync index into a brushed follower window", () => {
    expect(
      mapSyncIndexForBrushRange(4, { start: 0, end: 45 }, 10),
    ).toBe(4);
    expect(
      mapSyncIndexForBrushRange(8, { start: 0, end: 45 }, 10),
    ).toBeNull();
  });
});
