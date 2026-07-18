export type BrushRangePercent = {
  start: number;
  end: number;
};

/** Minimum visible brush window as a percent of the full domain (drag guard). */
export const DEFAULT_BRUSH_MIN_RANGE_PERCENT = 3;

export function brushRangeFromIndices(
  startIndex: number,
  endIndex: number,
  total: number,
): BrushRangePercent {
  if (total <= 0) {
    return { start: 0, end: 100 };
  }

  const start = (startIndex / total) * 100;
  const end = ((endIndex + 1) / total) * 100;

  return {
    start: Math.max(0, Math.min(100, start)),
    end: Math.max(start, Math.min(100, end)),
  };
}

export function indicesFromBrushRange(
  range: BrushRangePercent,
  total: number,
): { startIndex: number; endIndex: number } {
  if (total <= 0) {
    return { startIndex: 0, endIndex: 0 };
  }

  const startIndex = Math.max(
    0,
    Math.min(total - 1, Math.floor((range.start / 100) * total)),
  );
  const endIndex = Math.max(
    startIndex,
    Math.min(total - 1, Math.ceil((range.end / 100) * total) - 1),
  );

  return { startIndex, endIndex };
}

/** True when the range is missing or spans no usable window. */
export function isEmptyBrushRangePercent(range: BrushRangePercent | null | undefined): boolean {
  if (!range) return true;
  return range.end <= range.start || (range.start === 0 && range.end === 0);
}

/**
 * Clamp a percent brush range and enforce a minimum span (used by overview drag guard).
 */
export function normalizeBrushRangePercent(
  range: BrushRangePercent,
  minSpanPercent = DEFAULT_BRUSH_MIN_RANGE_PERCENT,
): BrushRangePercent {
  let start = Math.max(0, Math.min(100, range.start));
  let end = Math.max(0, Math.min(100, range.end));

  if (end < start) {
    [start, end] = [end, start];
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

  return { start, end };
}

/** Map drag indices to a percent range with optional minimum span guard. */
export function brushRangeFromIndicesWithMinGuard(
  startIndex: number,
  endIndex: number,
  total: number,
  minRangePercent = DEFAULT_BRUSH_MIN_RANGE_PERCENT,
): BrushRangePercent {
  return normalizeBrushRangePercent(
    brushRangeFromIndices(startIndex, endIndex, total),
    minRangePercent,
  );
}
