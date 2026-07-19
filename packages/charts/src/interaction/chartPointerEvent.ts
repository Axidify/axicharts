import type { PlotSeries } from "@axicharts/charts-canvas";

export type ChartCategoryInput =
  | string
  | {
      label: string;
      meta?: unknown;
    };

export type ChartSeriesInput = PlotSeries & {
  meta?: unknown;
};

export type NormalizedChartCategories = {
  labels: string[];
  meta: unknown[];
};

export function normalizeChartCategories(
  categories: ChartCategoryInput[] | undefined,
): NormalizedChartCategories {
  if (!categories?.length) {
    return { labels: [], meta: [] };
  }
  const labels: string[] = [];
  const meta: unknown[] = [];
  for (const item of categories) {
    if (typeof item === "string") {
      labels.push(item);
      meta.push(undefined);
    } else {
      labels.push(item.label);
      meta.push(item.meta);
    }
  }
  return { labels, meta };
}

export type ChartPointerEvent = {
  /** Category label as passed in `categories` */
  category: string;
  /** Index into categories / series data — primary key for filters */
  categoryIndex: number;
  /** Nearest series on hit; null for category-band click */
  seriesName: string | null;
  seriesIndex: number | null;
  /** Value at category when series is resolved */
  value: number | null;
  /** Category meta, or merged `{ ...categoryMeta, ...seriesMeta }` when series hit */
  meta?: unknown;
  nativeEvent: PointerEvent | KeyboardEvent;
};

export function buildChartPointerEvent({
  categoryIndex,
  labels,
  categoryMeta,
  series,
  seriesIndex,
  nativeEvent,
}: {
  categoryIndex: number;
  labels: string[];
  categoryMeta: unknown[];
  series: ChartSeriesInput[];
  seriesIndex: number | null;
  nativeEvent: PointerEvent | KeyboardEvent;
}): ChartPointerEvent {
  const category = labels[categoryIndex] ?? "";
  const baseMeta = categoryMeta[categoryIndex];
  if (seriesIndex == null) {
    return {
      category,
      categoryIndex,
      seriesName: null,
      seriesIndex: null,
      value: null,
      meta: baseMeta,
      nativeEvent,
    };
  }
  const hit = series[seriesIndex];
  const value = hit?.data[categoryIndex] ?? null;
  const seriesMeta = hit?.meta;
  const meta =
    baseMeta !== undefined || seriesMeta !== undefined
      ? { ...(baseMeta as object), ...(seriesMeta as object) }
      : undefined;
  return {
    category,
    categoryIndex,
    seriesName: hit?.name ?? null,
    seriesIndex,
    value: value ?? null,
    meta,
    nativeEvent,
  };
}

/** Pick first series with a defined value at index (including zero). */
export function defaultSeriesIndexAtCategory(
  series: PlotSeries[],
  categoryIndex: number,
): number | null {
  if (series.length === 0) return null;
  const withValue = series.findIndex((s) => s.data[categoryIndex] !== undefined);
  return withValue >= 0 ? withValue : 0;
}
