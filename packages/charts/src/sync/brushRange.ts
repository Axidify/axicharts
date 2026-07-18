export type BrushRange = {
  start: number;
  end: number;
};

import type { PlotSeries } from "@axicharts/charts-canvas";

export function sliceCartesianByBrushRange(
  categories: string[],
  series: PlotSeries[],
  range: BrushRange | null,
): { categories: string[]; series: PlotSeries[] } {
  if (!range || categories.length === 0) {
    return { categories, series };
  }

  const count = categories.length;
  const startIndex = Math.max(
    0,
    Math.min(count - 1, Math.floor((range.start / 100) * count)),
  );
  const endIndex = Math.max(
    startIndex + 1,
    Math.min(count, Math.ceil((range.end / 100) * count)),
  );

  return {
    categories: categories.slice(startIndex, endIndex),
    series: series.map((item) => ({
      ...item,
      data: item.data.slice(startIndex, endIndex),
    })),
  };
}

export function mapSyncIndexForBrushRange(
  syncIndex: number | null,
  range: BrushRange | null,
  totalCount: number,
): number | null {
  if (syncIndex == null || !range || totalCount === 0) {
    return syncIndex;
  }

  const startIndex = Math.max(
    0,
    Math.min(totalCount - 1, Math.floor((range.start / 100) * totalCount)),
  );
  const endIndex = Math.max(
    startIndex + 1,
    Math.min(totalCount, Math.ceil((range.end / 100) * totalCount)),
  );

  if (syncIndex < startIndex || syncIndex >= endIndex) {
    return null;
  }

  return syncIndex - startIndex;
}
