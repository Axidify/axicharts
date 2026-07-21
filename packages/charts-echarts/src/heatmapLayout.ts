import { isCompactTile } from "./themeBridge";

export type HeatmapLayout = {
  compact: boolean;
  showCellLabels: boolean;
  axisFontSize: number;
  rotateXLabels: number;
  gridBottom: number;
  visualMapHeight: number;
};

export function resolveHeatmapLayout(
  width: number,
  height: number,
  options: {
    showLabels?: boolean;
    xCategoryCount: number;
  },
): HeatmapLayout {
  const compact = isCompactTile(width, height);
  const denseX = options.xCategoryCount >= 12;

  return {
    compact,
    showCellLabels: Boolean(options.showLabels) && !compact,
    axisFontSize: compact ? 10 : 11,
    rotateXLabels: compact && denseX ? -45 : 0,
    gridBottom: compact ? 34 : 40,
    visualMapHeight: compact ? 8 : 12,
  };
}
