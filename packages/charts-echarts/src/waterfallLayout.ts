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
