import type { ChartSize } from "@axicharts/charts-core";
import { getLegendHeight } from "../chrome/Legend";
import type { LegendVariant } from "../chrome/chromeVariants";
import { shouldShowCartesianLegend } from "../interaction/mode";

/** Plot canvas height inside ChartContainer — legend is outside this budget. */
export function cartesianPlotHeight(
  size: ChartSize,
  overviewHeight = 0,
): number {
  return Math.max(1, Math.floor(size.height) - overviewHeight);
}

export type ResolveCartesianPlotSizeInput = {
  overviewHeight?: number;
  seriesCount?: number;
  mode: "static" | "interactive" | "live" | "presentation";
  legendVariant?: LegendVariant;
};

/** Plot slot size — reserves flow-legend chrome below the canvas. */
export function resolveCartesianPlotSize(
  size: ChartSize,
  {
    overviewHeight = 0,
    seriesCount = 0,
    mode,
    legendVariant,
  }: ResolveCartesianPlotSizeInput,
): { width: number; height: number; compact: boolean } {
  const compact = size.height < 72;
  const showLegend = shouldShowCartesianLegend({
    mode,
    seriesCount,
    compact,
  });
  const legendHeight = getLegendHeight(showLegend, legendVariant);
  const height = Math.max(
    1,
    cartesianPlotHeight(size, overviewHeight) - legendHeight,
  );
  return { width: size.width, height, compact };
}

/** Minimum container height for readable horizontal bar charts. */
export function horizontalBarMinHeight(categoryCount: number): number {
  return Math.max(160, categoryCount * 28 + 48);
}
