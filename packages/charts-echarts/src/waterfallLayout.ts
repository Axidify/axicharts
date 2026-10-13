import { isCompactTile } from "./themeBridge";

export type WaterfallLayout = {
  compact: boolean;
  axisFontSize: number;
  barMaxWidth: number;
  labelFontSize: number;
  rotateLabels: number;
  gridBottom: number;
};

export function resolveWaterfallLayout(
  width: number,
  height: number,
  categoryCount: number,
): WaterfallLayout {
  const compact = isCompactTile(width, height);
  const denseCategories = categoryCount >= 5;

  return {
    compact,
    axisFontSize: compact ? 10 : 11,
    barMaxWidth: compact ? 40 : 56,
    labelFontSize: compact ? 9 : 11,
    rotateLabels: compact && denseCategories ? -25 : 0,
    gridBottom: compact && denseCategories ? 36 : 0,
  };
}

/**
 * Round up to a multiple of a clean tick step (1 / 2 / 2.5 / 5 × 10^k, sized for
 * ~5 ticks) so the padded axis max stays readable without wasting much height.
 */
export function niceCeil(value: number): number {
  if (value <= 0) return 0;
  const rough = value / 5;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * magnitude >= rough) ?? 10) * magnitude;
  return Math.ceil(value / step) * step;
}

/**
 * Value-axis max with ~10% headroom so `position: "top"` delta labels on the
 * tallest bars don't sit on the plot's top edge.
 */
export function waterfallAxisMax(extent: { min: number; max: number }): number {
  const span = extent.max - Math.min(0, extent.min);
  return niceCeil(extent.max + span * 0.1);
}
