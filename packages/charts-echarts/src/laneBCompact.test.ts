import { describe, expect, it } from "vitest";
import { resolveFunnelLayout } from "./funnelLayout";
import { resolveWaterfallLayout } from "./waterfallLayout";
import { resolveHeatmapLayout } from "./heatmapLayout";
import { resolveCalendarHeatmapLayout } from "./calendarLayout";

describe("Lane B compact layouts", () => {
  it("tightens funnel insets @ 360×280", () => {
    const layout = resolveFunnelLayout(360, 280);
    expect(layout.compact).toBe(true);
    expect(layout.labelFontSize).toBe(9);
    expect(layout.inset.top).toBe(8);
  });

  it("rotates waterfall labels when there are five or more categories", () => {
    expect(resolveWaterfallLayout(360, 280, 4).rotateLabels).toBe(0);
    expect(resolveWaterfallLayout(360, 280, 6).rotateLabels).toBe(-25);
  });

  it("hides heatmap cell labels on compact tiles", () => {
    const layout = resolveHeatmapLayout(360, 280, {
      showLabels: true,
      xCategoryCount: 8,
    });
    expect(layout.showCellLabels).toBe(false);
    expect(layout.rotateXLabels).toBe(0);
    expect(resolveHeatmapLayout(360, 280, { showLabels: true, xCategoryCount: 12 }).rotateXLabels).toBe(
      -45,
    );
  });

  it("shrinks calendar cells and weekday labels @ compact", () => {
    const layout = resolveCalendarHeatmapLayout(360, 280);
    expect(layout.compact).toBe(true);
    expect(layout.cellSize).toEqual(["auto", 6]);
    expect(layout.inset.top).toBe(28);
  });
});
