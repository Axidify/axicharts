export type BrushRange = {
  start: number;
  end: number;
};

import type { PlotSeries } from "@axicharts/charts-canvas";

/** Minimum follower brush span as percent of the full domain. */
export const DEFAULT_BRUSH_MIN_RANGE_PERCENT = 3;

export function isEmptyBrushRange(range: BrushRange | null | undefined): boolean {
  if (!range) return true;
  return range.end <= range.start;
}

/** Clamp and enforce a minimum span; returns null when the range is unusable. */
export function normalizeBrushRange(
  range: BrushRange | null | undefined,
  minSpanPercent = DEFAULT_BRUSH_MIN_RANGE_PERCENT,
): BrushRange | null {
  if (!range) return null;

  let start = Math.max(0, Math.min(100, range.start));
  let end = Math.max(0, Math.min(100, range.end));

  if (end < start) {
    [start, end] = [end, start];
  }

  if (end <= start) {
    return null;
  }

  const span = end - start;
  if (span >= minSpanPercent) {
    return { start, end };
  }

  const deficit = minSpanPercent - span;
  const expandStart = Math.min(start, deficit / 2);
  const expandEnd = Math.min(100 - end, deficit - expandStart);
  start = Math.max(0, start - expandStart);
  end = Math.min(100, end + expandEnd);

  if (end - start < minSpanPercent) {
    end = Math.min(100, start + minSpanPercent);
    start = Math.max(0, end - minSpanPercent);
  }

  return end > start ? { start, end } : null;
}

export function sliceCartesianByBrushRange(
  categories: string[],
  series: PlotSeries[],
  range: BrushRange | null,
): { categories: string[]; series: PlotSeries[] } {
  const normalized = normalizeBrushRange(range);
  if (!normalized || categories.length === 0) {
    return { categories, series };
  }

  const count = categories.length;
  const startIndex = Math.max(
    0,
    Math.min(count - 1, Math.floor((normalized.start / 100) * count)),
  );
  const endIndex = Math.max(
    startIndex + 1,
    Math.min(count, Math.ceil((normalized.end / 100) * count)),
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
  const normalized = normalizeBrushRange(range);
  if (syncIndex == null || !normalized || totalCount === 0) {
    return syncIndex;
  }

  const startIndex = Math.max(
    0,
    Math.min(totalCount - 1, Math.floor((normalized.start / 100) * totalCount)),
  );
  const endIndex = Math.max(
    startIndex + 1,
    Math.min(totalCount, Math.ceil((normalized.end / 100) * totalCount)),
  );

  if (syncIndex < startIndex || syncIndex >= endIndex) {
    return null;
  }

  return syncIndex - startIndex;
}
