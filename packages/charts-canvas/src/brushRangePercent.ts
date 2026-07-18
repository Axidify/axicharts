export type BrushRangePercent = {
  start: number;
  end: number;
};

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
