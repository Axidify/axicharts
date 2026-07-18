export const DEFAULT_SCATTER_SYMBOL_SIZE = 9;
export const DEFAULT_BUBBLE_SIZE_RANGE: [number, number] = [6, 28];

/** Resolve ECharts scatter symbol size from a data value tuple or explicit size. */
export function bubbleSymbolSize(
  value: unknown,
  fallback = DEFAULT_SCATTER_SYMBOL_SIZE,
): number {
  if (Array.isArray(value) && typeof value[2] === "number" && Number.isFinite(value[2])) {
    return value[2];
  }
  return fallback;
}

export function bubbleSizeExtent(
  series: { points: { size?: number }[] }[],
): { min: number; max: number } {
  const sizes = series
    .flatMap((item) => item.points)
    .map((point) => point.size)
    .filter((size): size is number => typeof size === "number" && Number.isFinite(size));

  if (sizes.length === 0) {
    return {
      min: DEFAULT_BUBBLE_SIZE_RANGE[0],
      max: DEFAULT_BUBBLE_SIZE_RANGE[1],
    };
  }

  return { min: Math.min(...sizes), max: Math.max(...sizes) };
}
