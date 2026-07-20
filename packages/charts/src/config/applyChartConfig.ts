import type { PlotSeries } from "@axicharts/charts-canvas";
import type { PieSlice } from "@axicharts/charts-echarts";
import type { FunnelStage } from "@axicharts/charts-echarts";
import type { ChartConfig } from "../container/ChartLayoutContext";

export type ApplyChartConfigOptions = {
  /** Category axis labels — enables per-bar fills from config keys when a single series is used. */
  categories?: string[];
};

export function configLookupKey(item: {
  key?: string;
  name: string;
}): string {
  return item.key ?? item.name;
}

function applyCategoryFillsFromConfig(
  series: PlotSeries[],
  config: ChartConfig,
  categories: string[],
): PlotSeries[] {
  if (series.length !== 1 || categories.length === 0) return series;

  const [first, ...rest] = series;
  if (!first || (first.fills && first.fills.length > 0)) return series;

  const fills = categories.map((category) => config[category]?.color);
  if (!fills.some((color) => color != null)) return series;

  return [
    {
      ...first,
      fills: categories.map(
        (category, index) =>
          config[category]?.color ?? fills[index] ?? first.color ?? "",
      ),
    },
    ...rest,
  ];
}

export function applyChartConfigToSeries(
  series: PlotSeries[],
  config: ChartConfig | undefined,
  options: ApplyChartConfigOptions = {},
): PlotSeries[] {
  if (!config) return series;

  const mapped = series.map((item) => {
    const entry = config[configLookupKey(item)];
    if (!entry) return item;

    return {
      ...item,
      name: entry.label ?? item.name,
      color: item.color ?? entry.color,
      tone: item.tone ?? entry.tone,
    };
  });

  if (options.categories?.length) {
    return applyCategoryFillsFromConfig(mapped, config, options.categories);
  }

  return mapped;
}

export function applyChartConfigToPieSlices(
  slices: PieSlice[],
  config: ChartConfig | undefined,
): PieSlice[] {
  if (!config) return slices;

  return slices.map((slice) => {
    const entry = config[configLookupKey(slice)];
    if (!entry) return slice;

    return {
      ...slice,
      name: entry.label ?? slice.name,
      color: slice.color ?? entry.color,
      tone: slice.tone ?? entry.tone,
    };
  });
}

export function applyChartConfigToFunnelStages(
  stages: FunnelStage[],
  config: ChartConfig | undefined,
): FunnelStage[] {
  if (!config) return stages;

  return stages.map((stage) => {
    const entry = config[configLookupKey(stage)];
    if (!entry) return stage;

    return {
      ...stage,
      name: entry.label ?? stage.name,
      color: stage.color ?? entry.color,
      tone: stage.tone ?? entry.tone,
    };
  });
}
