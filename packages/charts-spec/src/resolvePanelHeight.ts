import type { PanelChartType } from "./types";

const MIN_PLOT_HEIGHT: Partial<Record<string, number>> = {
  line: 160,
  area: 160,
  bar: 160,
  cartesian: 160,
  combo: 160,
  blocks: 160,
  scatter: 200,
  pie: 200,
  donut: 200,
  distribution: 200,
  waterfall: 200,
  candlestick: 220,
  heatmap: 200,
  histogram: 180,
  gauge: 120,
};

/** Enforce minimum plot height for dashboard panels without breaking KPI/sparkline tiles. */
export function resolvePanelHeight(
  type: PanelChartType,
  requested?: number,
  fallback = 240,
): number {
  const height = requested ?? fallback;
  if (height < 100) return height;
  if (type === "stat") return Math.max(height, 48);
  if (type === "table") return Math.max(height, 120);
  const plotMin = MIN_PLOT_HEIGHT[type] ?? 160;
  return Math.max(height, plotMin);
}

/** Title row + gap when `wrapChart` renders `spec.title` above `ChartContainer`. */
export const PANEL_TITLE_CHROME_PX = 23;

/** Plot height inside a titled panel — outer height includes title chrome. */
export function panelChartHeight(
  type: PanelChartType,
  requested: number | undefined,
  hasTitle: boolean,
  fallback = 240,
): number {
  const outer = resolvePanelHeight(type, requested, fallback);
  if (!hasTitle || outer < 100) return outer;
  return Math.max(100, outer - PANEL_TITLE_CHROME_PX);
}
