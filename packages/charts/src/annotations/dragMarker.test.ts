import { describe, expect, it } from "vitest";
import {
  resolveCartesianPlotInsets,
  plotInnerSize,
} from "./cartesianPlotInsets";
import {
  clampMarkerY,
  categoryIndexToRatio,
  nearestCategoryIndex,
  normalizeDragMarkerPosition,
  pixelDeltaToMarkerY,
  snapMarkerToCategory,
} from "./dragMarker";

describe("resolveCartesianPlotInsets", () => {
  it("matches compact uPlot padding for short plots", () => {
    expect(resolveCartesianPlotInsets({ height: 60 })).toEqual({
      top: 4,
      right: 6,
      bottom: 4,
      left: 6,
    });
  });

  it("uses dual-axis left inset when requested", () => {
    expect(resolveCartesianPlotInsets({ height: 240, dualAxis: true })).toEqual({
      top: 8,
      right: 14,
      bottom: 8,
      left: 48,
    });
  });
});

describe("plotInnerSize", () => {
  it("subtracts insets from outer dimensions", () => {
    expect(
      plotInnerSize(400, 200, { top: 8, right: 14, bottom: 8, left: 14 }),
    ).toEqual({ width: 372, height: 184 });
  });
});

describe("drag marker normalization", () => {
  it("clamps y values to the plot range", () => {
    expect(clampMarkerY(120, 0, 100)).toBe(100);
    expect(clampMarkerY(-5, 0, 100)).toBe(0);
  });

  it("converts pixel delta to data-space y", () => {
    expect(
      pixelDeltaToMarkerY({ deltaY: -50, plotHeight: 100, yMin: 0, yMax: 100 }),
    ).toBe(50);
  });

  it("snaps marker x to nearest category on drag end", () => {
    expect(
      snapMarkerToCategory({ x: "Tue", y: 42 }, ["Mon", "Tue", "Wed"]),
    ).toEqual({ x: "Tue", y: 42, categoryIndex: 1 });
  });

  it("normalizes drag position within plot bounds", () => {
    const next = normalizeDragMarkerPosition({
      startY: 50,
      deltaY: -25,
      plotHeight: 100,
      yMin: 0,
      yMax: 100,
      marker: { x: "Mon", y: 50 },
      categories: ["Mon", "Tue", "Wed"],
      snapToCategories: true,
    });
    expect(next.y).toBe(75);
    expect(next.x).toBe("Mon");
  });

  it("resolves nearest category index from ratio", () => {
    expect(nearestCategoryIndex(0, 3)).toBe(0);
    expect(nearestCategoryIndex(0.5, 3)).toBe(1);
    expect(nearestCategoryIndex(1, 3)).toBe(2);
  });

  it("maps category index to horizontal ratio", () => {
    expect(categoryIndexToRatio(1, 3)).toBe(0.5);
    expect(categoryIndexToRatio(0, 1)).toBe(0.5);
  });
});
