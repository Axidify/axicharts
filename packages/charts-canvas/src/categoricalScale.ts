/** Ordinal / categorical uPlot scale helpers for compact dashboard bar charts. */

export const COMPACT_PLOT_HEIGHT = 72;

export function isCompactPlotHeight(height: number): boolean {
  return height < COMPACT_PLOT_HEIGHT;
}

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
  if (categoryCount <= 5) {
    return barSeriesCount === 1 ? [0.74, 100] : [0.6, 100];
  }
  if (categoryCount <= 8) {
    return barSeriesCount === 1 ? [0.62, 100] : [0.5, 100];
  }
  if (categoryCount <= 12) {
    return barSeriesCount === 1 ? [0.58, 100] : [0.48, 100];
  }
  return barSeriesCount === 1 ? [0.55, 100] : [0.48, 100];
}

export function ordinalBarGapPx(categoryCount: number, themeBarGap: number): number {
  const base = Math.max(3, Math.round(themeBarGap * 28));
  // Compact tiles (≤5 cats @ ~360px): keep a visible gap without skinny bars.
  if (categoryCount <= 5) return Math.min(base, 5);
  if (categoryCount <= 8) return Math.min(base, 6);
  return base;
}

/** Bottom axis height for category labels (px). */
export function categoryAxisSize(): number {
  return 22;
}

/** Left axis width for horizontal bar category labels (px). */
export function categoryAxisSizeForLabels(
  categories: string[],
  compact = false,
): number {
  if (compact || categories.length === 0) return 0;
  const maxLen = Math.max(...categories.map((label) => label.length), 0);
  return Math.min(148, Math.max(52, Math.ceil(maxLen * 5.8) + 12));
}

/** Nice ceiling for horizontal bar value axes — bars must not overshoot the last tick. */
export function horizontalValueAxisMax(dataMax: number): number {
  if (dataMax <= 0) return 10;
  const padded = dataMax * 1.12;
  const step =
    padded <= 15
      ? 5
      : padded <= 40
        ? 10
        : padded <= 100
          ? 15
          : padded <= 200
            ? 20
            : 50;
  return Math.ceil(padded / step) * step;
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
  return [topPad, Math.max(right, side), 10, side];
}

/** Padding for horizontal bar charts — category axis on the left. */
export function horizontalBarChartPadding(
  categoryCount: number,
  leftAxisSize: number,
  topPad = 8,
  showValueLabels = false,
): [number, number, number, number] {
  const right = showValueLabels ? 36 : 14;
  const bottom = categoryCount > 0 ? 32 : 10;
  const top = topPad;
  const left = Math.max(14, leftAxisSize);
  return [top, right, bottom, left];
}

export function categorySlotWidth(plotWidth: number, categoryCount: number): number | undefined {
  if (plotWidth <= 0 || categoryCount <= 0) return undefined;
  return plotWidth / categoryCount;
}
