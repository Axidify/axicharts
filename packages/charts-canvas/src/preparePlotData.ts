import { downsampleIndicesLTTB } from "@axicharts/charts-core";
import type { PlotSeries } from "./types";

export type PreparedPlotData = {
  categories: string[];
  series: PlotSeries[];
  sampled: boolean;
  originalLength: number;
};

function pickReferenceSeries(series: PlotSeries[]): number[] {
  if (series.length === 0) return [];
  let best = series[0].data;
  let bestSpan = 0;
  for (const item of series) {
    if (item.data.length === 0) continue;
    const max = Math.max(...item.data);
    const min = Math.min(...item.data);
    const span = max - min;
    if (span > bestSpan) {
      bestSpan = span;
      best = item.data;
    }
  }
  return best;
}

export function preparePlotData(
  categories: string[],
  series: PlotSeries[],
  maxPoints: number | null,
): PreparedPlotData {
  const originalLength = categories.length;
  if (
    maxPoints == null ||
    originalLength <= maxPoints ||
    series.length === 0
  ) {
    return { categories, series, sampled: false, originalLength };
  }

  const reference = pickReferenceSeries(series);
  const indices = downsampleIndicesLTTB(reference, maxPoints);

  return {
    categories: indices.map((index) => categories[index] ?? ""),
    series: series.map((item) => ({
      ...item,
      data: indices.map((index) => item.data[index] ?? 0),
      fills: item.fills
        ? indices.map((index) => item.fills![index] ?? item.fills![0] ?? "")
        : undefined,
      sizes: item.sizes
        ? indices.map((index) => item.sizes![index] ?? item.sizes![0] ?? 0)
        : undefined,
    })),
    sampled: true,
    originalLength,
  };
}
