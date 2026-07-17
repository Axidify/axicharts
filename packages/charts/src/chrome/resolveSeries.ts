import type { PlotSeries } from "@axicharts/charts-canvas";
import { SERIES_COLORS } from "@axicharts/charts-canvas";
import type { ChartConfig } from "../container/ChartLayoutContext";
import { configLookupKey } from "../config/applyChartConfig";

export function resolveSeriesColor(
  series: PlotSeries,
  config?: ChartConfig,
): string {
  if (series.color) return series.color;

  const key = configLookupKey(series);
  const fromConfig = config?.[key]?.color;
  if (fromConfig) return fromConfig;

  return SERIES_COLORS[series.tone ?? "default"];
}

export function resolveSeriesLabel(
  series: PlotSeries,
  config?: ChartConfig,
): string {
  const key = configLookupKey(series);
  return config?.[key]?.label ?? series.name;
}

export function formatSeriesValue(value: number, suffix = ""): string {
  const rounded =
    Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded}${suffix}`;
}
