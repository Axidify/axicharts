import { describe, expect, it } from "vitest";
import {
  categoryAxisSizeForLabels,
  categoryChartPadding,
  categoryXScale,
  horizontalBarChartPadding,
  horizontalValueAxisMax,
  ordinalBarSize,
} from "./categoricalScale";

describe("categoricalScale", () => {
  it("insets ordinal x range so edge categories are not on plot borders", () => {
    expect(categoryXScale(2).range()).toEqual([-0.5, 1.5]);
    expect(categoryXScale(4).range()).toEqual([-0.5, 3.5]);
    expect(categoryXScale(1).range()).toEqual([-0.5, 0.5]);
  });

  it("uses wider bars for few categories", () => {
    expect(ordinalBarSize(2, 1)).toEqual([0.74, 100]);
    expect(ordinalBarSize(5, 1)).toEqual([0.74, 100]);
    expect(ordinalBarSize(12, 2)).toEqual([0.48, 100]);
  });

  it("adds side padding for compact dashboards", () => {
    const padding = categoryChartPadding(320, 4);
    expect(padding[1]).toBeGreaterThanOrEqual(14);
    expect(padding[3]).toBeGreaterThanOrEqual(14);
  });

  it("sizes the left axis from the longest category label", () => {
    expect(categoryAxisSizeForLabels(["A", "Short"])).toBeGreaterThanOrEqual(52);
    expect(categoryAxisSizeForLabels(["P1 – Critical", "P4 – Low"])).toBeLessThanOrEqual(
      100,
    );
    expect(
      categoryAxisSizeForLabels(["P1 – Critical outage in production gateway"]),
    ).toBeLessThanOrEqual(148);
  });

  it("ceilings horizontal value axes past the data max", () => {
    expect(horizontalValueAxisMax(45)).toBe(60);
    expect(horizontalValueAxisMax(12)).toBe(15);
    expect(horizontalValueAxisMax(180)).toBe(250);
  });

  it("reserves left gutter space for horizontal bar charts", () => {
    const [top, right, bottom, left] = horizontalBarChartPadding(8, 96, 12, true);
    expect(top).toBe(12);
    expect(right).toBe(36);
    expect(bottom).toBe(32);
    expect(left).toBe(96);
  });
});
