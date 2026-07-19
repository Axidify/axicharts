import { useMemo } from "react";
import {
  normalizeChartCategories,
  type ChartCategoryInput,
  type ChartPointerEvent,
  type ChartSeriesInput,
  type NormalizedChartCategories,
} from "./chartPointerEvent";

export type CartesianPointerChartProps<TMeta = unknown> = {
  categories?: ChartCategoryInput<TMeta>[];
  series?: ChartSeriesInput[];
  selectedCategoryIndex?: number;
  onCategoryClick?: (event: ChartPointerEvent<TMeta>) => void;
  onSeriesClick?: (event: ChartPointerEvent<TMeta>) => void;
};

export function useCartesianCategoryMeta<TMeta = unknown>(
  categoriesProp: ChartCategoryInput<TMeta>[] | undefined,
): NormalizedChartCategories<TMeta> {
  return useMemo(() => normalizeChartCategories(categoriesProp), [categoriesProp]);
}

export function isFlatZeroSeries(series: ChartSeriesInput[]): boolean {
  if (series.length === 0) return false;
  return series.every((s) => s.data.length > 0 && s.data.every((v) => v === 0));
}
