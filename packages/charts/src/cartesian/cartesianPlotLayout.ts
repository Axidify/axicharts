import type { ChartSize } from "@axicharts/charts-core";

/** Plot canvas height inside ChartContainer — legend is outside this budget. */
export function cartesianPlotHeight(
  size: ChartSize,
  overviewHeight = 0,
): number {
  return Math.max(1, Math.floor(size.height) - overviewHeight);
}
