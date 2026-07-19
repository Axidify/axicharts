/** Ordinal / categorical uPlot scale helpers for compact dashboard bar charts. */

export function categoryXScale(categoryCount: number): {
  time: false;
  range: () => [number, number];
} {
  if (categoryCount <= 0) {
    return { time: false, range: () => [0, 1] };
  }
  if (categoryCount === 1) {
    return { time: false, range: () => [-0.5, 0.5] };
  }
  return { time: false, range: () => [-0.5, categoryCount - 0.5] };
}

/** Bar band fill ratio — wider bars when there are few categories. */
export function ordinalBarSize(
  categoryCount: number,
  barSeriesCount: number,
): [number, number] {
  if (categoryCount <= 4) {
    return barSeriesCount === 1 ? [0.72, 100] : [0.58, 100];
  }
  if (categoryCount <= 8) {
    return barSeriesCount === 1 ? [0.62, 100] : [0.5, 100];
  }
  return barSeriesCount === 1 ? [0.55, 100] : [0.45, 100];
}

export function ordinalBarGapPx(categoryCount: number, themeBarGap: number): number {
  const base = Math.max(3, Math.round(themeBarGap * 28));
  if (categoryCount <= 4) return Math.min(base, 4);
  if (categoryCount <= 8) return Math.min(base, 6);
  return base;
}

/** Bottom axis height for category labels (px). */
export function categoryAxisSize(): number {
  return 22;
}

/** Side padding so edge tick labels are not clipped. */
export function categoryChartPadding(
  plotWidth: number,
  categoryCount: number,
  dualAxisRight = false,
  topPad = 8,
): [number, number, number, number] {
  const right = dualAxisRight ? 48 : 14;
  if (categoryCount <= 0 || plotWidth <= 0) {
    return [topPad, right, 8, 14];
  }
  const slotWidth = plotWidth / categoryCount;
  const side = Math.min(28, Math.max(14, Math.round(slotWidth * 0.2)));
  return [topPad, Math.max(right, side), 8, side];
}

export function categorySlotWidth(plotWidth: number, categoryCount: number): number | undefined {
  if (plotWidth <= 0 || categoryCount <= 0) return undefined;
  return plotWidth / categoryCount;
}
