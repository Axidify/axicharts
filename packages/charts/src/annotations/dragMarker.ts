import { categoryToIndex } from "@axicharts/charts-canvas";
import type { CartesianPlotInsets } from "./cartesianPlotInsets";
import { plotInnerSize } from "./cartesianPlotInsets";

export type MarkerDragPosition = {
  x?: number | string;
  y: number;
  categoryIndex: number | null;
};

export function clampMarkerY(y: number, yMin: number, yMax: number): number {
  const low = Math.min(yMin, yMax);
  const high = Math.max(yMin, yMax);
  return Math.min(high, Math.max(low, y));
}

export function nearestCategoryIndex(
  ratio: number,
  categoryCount: number,
): number {
  if (categoryCount <= 0) return 0;
  if (categoryCount === 1) return 0;
  const clamped = Math.min(1, Math.max(0, ratio));
  return Math.round(clamped * (categoryCount - 1));
}

export function categoryIndexToRatio(
  index: number,
  categoryCount: number,
): number {
  if (categoryCount <= 1) return 0.5;
  return index / (categoryCount - 1);
}

export function markerPixelPosition({
  marker,
  categories,
  width,
  height,
  insets,
  yMin,
  yMax,
}: {
  marker: { x?: number | string; y: number };
  categories: string[];
  width: number;
  height: number;
  insets: CartesianPlotInsets;
  yMin: number;
  yMax: number;
}): { left: number; top: number } {
  const { width: plotWidth, height: plotHeight } = plotInnerSize(
    width,
    height,
    insets,
  );
  const index = categoryToIndex(marker.x, categories);
  const xRatio =
    index != null
      ? categoryIndexToRatio(index, categories.length)
      : 0.5;
  const yRatio = (clampMarkerY(marker.y, yMin, yMax) - yMin) / (yMax - yMin || 1);

  return {
    left: insets.left + xRatio * plotWidth,
    top: insets.top + (1 - yRatio) * plotHeight,
  };
}

export function pixelDeltaToMarkerY({
  deltaY,
  plotHeight,
  yMin,
  yMax,
}: {
  deltaY: number;
  plotHeight: number;
  yMin: number;
  yMax: number;
}): number {
  if (plotHeight <= 0) return yMin;
  return (-deltaY / plotHeight) * (yMax - yMin);
}

export function snapMarkerToCategory(
  marker: { x?: number | string; y: number },
  categories: string[],
): MarkerDragPosition {
  const index = categoryToIndex(marker.x, categories);
  const categoryIndex =
    index != null ? index : categories.length > 0 ? 0 : null;
  return {
    x: categoryIndex != null ? categories[categoryIndex] : marker.x,
    y: marker.y,
    categoryIndex,
  };
}

export function normalizeDragMarkerPosition({
  startY,
  deltaY,
  plotHeight,
  yMin,
  yMax,
  marker,
  categories,
  snapToCategories = true,
}: {
  startY: number;
  deltaY: number;
  plotHeight: number;
  yMin: number;
  yMax: number;
  marker: { x?: number | string; y: number };
  categories: string[];
  snapToCategories?: boolean;
}): MarkerDragPosition {
  const nextY = clampMarkerY(
    startY + pixelDeltaToMarkerY({ deltaY, plotHeight, yMin, yMax }),
    yMin,
    yMax,
  );
  const base = { ...marker, y: nextY };
  if (!snapToCategories) {
    return {
      x: base.x,
      y: base.y,
      categoryIndex: categoryToIndex(base.x, categories),
    };
  }
  return snapMarkerToCategory(base, categories);
}
