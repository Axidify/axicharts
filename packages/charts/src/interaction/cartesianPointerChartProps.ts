import { useMemo } from "react";
import {
  normalizeChartCategories,
  type ChartCategoryInput,
  type ChartPointerEvent,
  type ChartSeriesInput,
} from "./chartPointerEvent";

export type CartesianPointerChartProps = {
  categories?: ChartCategoryInput[];
  series?: ChartSeriesInput[];
  selectedCategoryIndex?: number;
  onCategoryClick?: (event: ChartPointerEvent) => void;
  onSeriesClick?: (event: ChartPointerEvent) => void;
};

export function useCartesianCategoryMeta(
  categoriesProp: ChartCategoryInput[] | undefined,
): ReturnType<typeof normalizeChartCategories> {
  return useMemo(() => normalizeChartCategories(categoriesProp), [categoriesProp]);
}

export function isFlatZeroSeries(series: ChartSeriesInput[]): boolean {
  if (series.length === 0) return false;
  return series.every((s) => s.data.length > 0 && s.data.every((v) => v === 0));
}
