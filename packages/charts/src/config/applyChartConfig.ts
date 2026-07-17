import type { PlotSeries } from "@axicharts/charts-canvas";
import type { PieSlice } from "@axicharts/charts-echarts";
import type { FunnelStage } from "@axicharts/charts-echarts";
import type { ChartConfig } from "../container/ChartLayoutContext";

export function configLookupKey(item: {
  key?: string;
  name: string;
}): string {
  return item.key ?? item.name;
}

export function applyChartConfigToSeries(
  series: PlotSeries[],
  config: ChartConfig | undefined,
): PlotSeries[] {
  if (!config) return series;

  return series.map((item) => {
    const entry = config[configLookupKey(item)];
    if (!entry) return item;

    return {
      ...item,
      name: entry.label ?? item.name,
      color: item.color ?? entry.color,
      tone: item.tone ?? entry.tone,
    };
  });
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
