import { describe, expect, it } from "vitest";
import {
  categoryChartPadding,
  categoryXScale,
  ordinalBarSize,
} from "./categoricalScale";

describe("categoricalScale", () => {
  it("insets ordinal x range so edge categories are not on plot borders", () => {
    expect(categoryXScale(2).range()).toEqual([-0.5, 1.5]);
    expect(categoryXScale(4).range()).toEqual([-0.5, 3.5]);
    expect(categoryXScale(1).range()).toEqual([-0.5, 0.5]);
  });

  it("uses wider bars for few categories", () => {
    expect(ordinalBarSize(2, 1)).toEqual([0.72, 100]);
    expect(ordinalBarSize(12, 2)).toEqual([0.48, 100]);
  });

  it("adds side padding for compact dashboards", () => {
    const padding = categoryChartPadding(320, 4);
    expect(padding[1]).toBeGreaterThanOrEqual(14);
    expect(padding[3]).toBeGreaterThanOrEqual(14);
  });
});
