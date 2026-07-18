import type { SeriesTone } from "./types";
import {
  computeBoxStats,
  computeKde,
  type KdePoint,
} from "./violinTypes";

export type { KdePoint };

export type RidgelineItem = {
  category: string;
  samples?: number[];
  density?: KdePoint[];
  tone?: SeriesTone;
};

export type RidgelineSeries = {
  name: string;
  items: RidgelineItem[];
  tone?: SeriesTone;
};

export function ridgelineCategories(
  items: RidgelineItem[] | RidgelineSeries[],
): string[] {
  if (items.length === 0) return [];
  const first = items[0]!;
  if ("items" in first) {
    return first.items.map((item) => item.category);
  }
  return (items as RidgelineItem[]).map((item) => item.category);
}

export function resolveRidgelineDensity(
  item: RidgelineItem,
  bandwidth?: number,
): KdePoint[] {
  if (item.density && item.density.length > 0) {
    return item.density;
  }
  if (item.samples && item.samples.length > 0) {
    return computeKde(item.samples, bandwidth);
  }
  return [];
}

export function resolveRidgelineMedian(item: RidgelineItem): number | null {
  if (item.samples && item.samples.length > 0) {
    return computeBoxStats(item.samples).median;
  }
  return null;
}

/** Pixel height for a KDE density value within a category band. */
export function ridgeDensityHeight(
  density: number,
  maxDensity: number,
  bandHeightPx: number,
  ridgeHeightRatio = 0.85,
): number {
  if (maxDensity <= 0 || bandHeightPx <= 0) return 0;
  return (density / maxDensity) * bandHeightPx * ridgeHeightRatio;
}

/** Vertical baseline offset per ridge index (for stacked joyplot bands). */
export function ridgeBaselineOffset(
  categoryIndex: number,
  totalCategories: number,
): number {
  if (totalCategories <= 0) return 0;
  return totalCategories - 1 - categoryIndex;
}

export { computeKde };
