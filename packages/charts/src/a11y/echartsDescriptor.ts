import type { CalendarHeatmapData, HeatmapMatrix, OhlcPoint, PieSlice } from "@axicharts/charts-echarts";
import type { FunnelStage, PictorialBarData } from "@axicharts/charts-echarts";
import type { HierarchyNode } from "@axicharts/charts-echarts";
import type {
  CandlestickA11yDescriptor,
  CalendarHeatmapA11yDescriptor,
  FunnelA11yDescriptor,
  PictorialBarA11yDescriptor,
  HeatmapA11yDescriptor,
  HierarchyA11yDescriptor,
  HierarchyA11yItem,
  ParallelA11yDescriptor,
  PieA11yDescriptor,
  SingleValueA11yDescriptor,
  ThemeRiverA11yDescriptor,
  BumpA11yDescriptor,
  WordCloudA11yDescriptor,
} from "./types";
import { singleValueA11ySummary } from "./singleValueDescriptor";

export function flattenHierarchyNodes(
  nodes: HierarchyNode[],
  parentPath = "",
): HierarchyA11yItem[] {
  const items: HierarchyA11yItem[] = [];
  for (const node of nodes) {
    const path = parentPath ? `${parentPath} > ${node.name}` : node.name;
    if (node.children?.length) {
      items.push(...flattenHierarchyNodes(node.children, path));
    } else if (node.value != null) {
      items.push({ name: node.name, value: node.value, path });
    }
  }
  return items;
}

export function buildPieA11yDescriptor({
  slices,
  innerRadius = 0,
  title,
  description,
}: {
  slices: PieSlice[];
  innerRadius?: number;
  title?: string;
  description?: string;
}): PieA11yDescriptor {
  return {
    kind: "pie",
    chartType: innerRadius > 0 ? "donut" : "pie",
    title: title ?? slices.map((slice) => slice.name).join(", "),
    description,
    slices: slices.map((slice) => ({ name: slice.name, value: slice.value })),
  };
}

export function buildCandlestickA11yDescriptor({
  categories,
  data,
  volume,
  title,
  description,
}: {
  categories: string[];
  data: OhlcPoint[];
  volume?: number[];
  title?: string;
  description?: string;
}): CandlestickA11yDescriptor {
  return {
    kind: "candlestick",
    title: title ?? "Candlestick chart",
    description,
    categories: [...categories],
    data: data.map((point, index) => ({
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: volume?.[index],
    })),
  };
}

export function buildHeatmapA11yDescriptor({
  matrix,
  title,
  description,
  xLabel,
  yLabel,
}: {
  matrix: HeatmapMatrix;
  title?: string;
  description?: string;
  xLabel?: string;
  yLabel?: string;
}): HeatmapA11yDescriptor {
  return {
    kind: "heatmap",
    title: title ?? "Heatmap",
    description,
    xLabel,
    yLabel,
    xCategories: [...matrix.xCategories],
    yCategories: [...matrix.yCategories],
    values: matrix.values.map((row) => [...row]),
  };
}

export function buildCalendarHeatmapA11yDescriptor({
  data,
  year,
  title,
  description,
}: {
  data: CalendarHeatmapData;
  year?: number;
  title?: string;
  description?: string;
}): CalendarHeatmapA11yDescriptor {
  return {
    kind: "calendar",
    title: title ?? "Calendar heatmap",
    description,
    year: year ?? data.year,
    points: data.points.map((point) => ({ date: point.date, value: point.value })),
  };
}

export function buildFunnelA11yDescriptor({
  stages,
  title,
  description,
}: {
  stages: FunnelStage[];
  title?: string;
  description?: string;
}): FunnelA11yDescriptor {
  return {
    kind: "funnel",
    title: title ?? stages.map((stage) => stage.name).join(", "),
    description,
    stages: stages.map((stage) => ({ name: stage.name, value: stage.value })),
  };
}

export function buildPictorialBarA11yDescriptor({
  data,
  title,
  description,
}: {
  data: PictorialBarData;
  title?: string;
  description?: string;
}): PictorialBarA11yDescriptor {
  return {
    kind: "pictorial-bar",
    title: title ?? data.items.map((item) => item.category).join(", "),
    description,
    items: data.items.map((item) => ({
      category: item.category,
      value: item.value,
    })),
  };
}

export function buildHierarchyA11yDescriptor({
  chartType,
  nodes,
  title,
  description,
}: {
  chartType: HierarchyA11yDescriptor["chartType"];
  nodes: HierarchyNode[];
  title?: string;
  description?: string;
}): HierarchyA11yDescriptor {
  const items = flattenHierarchyNodes(nodes);
  return {
    kind: "hierarchy",
    chartType,
    title: title ?? `${chartType} chart`,
    description,
    items,
  };
}

export function buildParallelA11yDescriptor({
  dimensions,
  series,
  title,
  description,
}: {
  dimensions: { name: string }[];
  series: { name: string; values: number[] }[];
  title?: string;
  description?: string;
}): ParallelA11yDescriptor {
  return {
    kind: "parallel",
    title: title ?? dimensions.map((dimension) => dimension.name).join(", "),
    description,
    dimensions: dimensions.map((dimension) => dimension.name),
    series: series.map((item) => ({
      name: item.name,
      values: [...item.values],
    })),
  };
}

export function buildThemeRiverA11yDescriptor({
  points,
  title,
  description,
}: {
  points: { time: string | number; value: number; series: string }[];
  title?: string;
  description?: string;
}): ThemeRiverA11yDescriptor {
  const seriesNames = [...new Set(points.map((point) => point.series))];
  return {
    kind: "theme-river",
    title: title ?? seriesNames.join(", "),
    description,
    points: points.map((point) => ({
      time: point.time,
      value: point.value,
      series: point.series,
    })),
  };
}

export function buildBumpA11yDescriptor({
  data,
  title,
  description,
}: {
  data: { categories: string[]; series: { name: string; ranks: number[] }[] };
  title?: string;
  description?: string;
}): BumpA11yDescriptor {
  return {
    kind: "bump",
    title: title ?? data.series.map((item) => item.name).join(", "),
    description,
    categories: [...data.categories],
    series: data.series.map((item) => ({
      name: item.name,
      ranks: [...item.ranks],
    })),
  };
}

export function buildWordCloudA11yDescriptor({
  words,
  title,
  description,
}: {
  words: { text: string; value: number }[];
  title?: string;
  description?: string;
}): WordCloudA11yDescriptor {
  return {
    kind: "word-cloud",
    title: title ?? words.map((word) => word.text).join(", "),
    description,
    words: words.map((word) => ({
      text: word.text,
      value: word.value,
    })),
  };
}

export function pieA11ySummary(descriptor: PieA11yDescriptor): string {
  return `${descriptor.chartType} chart with ${descriptor.slices.length} segments`;
}

export function candlestickA11ySummary(descriptor: CandlestickA11yDescriptor): string {
  return `Candlestick chart with ${descriptor.categories.length} periods`;
}

export function heatmapA11ySummary(descriptor: HeatmapA11yDescriptor): string {
  return `Heatmap with ${descriptor.xCategories.length} columns and ${descriptor.yCategories.length} rows`;
}

export function calendarHeatmapA11ySummary(
  descriptor: CalendarHeatmapA11yDescriptor,
): string {
  return `Calendar heatmap with ${descriptor.points.length} days`;
}

export function funnelA11ySummary(descriptor: FunnelA11yDescriptor): string {
  return `Funnel chart with ${descriptor.stages.length} stages`;
}

export function pictorialBarA11ySummary(
  descriptor: PictorialBarA11yDescriptor,
): string {
  return `Pictorial bar chart with ${descriptor.items.length} categories`;
}

export function hierarchyA11ySummary(descriptor: HierarchyA11yDescriptor): string {
  return `${descriptor.chartType} chart with ${descriptor.items.length} leaf nodes`;
}

export function parallelA11ySummary(descriptor: ParallelA11yDescriptor): string {
  return `Parallel coordinates with ${descriptor.dimensions.length} dimensions and ${descriptor.series.length} series`;
}

export function themeRiverA11ySummary(descriptor: ThemeRiverA11yDescriptor): string {
  const seriesCount = new Set(descriptor.points.map((point) => point.series)).size;
  return `Theme river with ${seriesCount} streams and ${descriptor.points.length} points`;
}

export function bumpA11ySummary(descriptor: BumpA11yDescriptor): string {
  return `Bump chart with ${descriptor.series.length} entities across ${descriptor.categories.length} periods`;
}

export function wordCloudA11ySummary(descriptor: WordCloudA11yDescriptor): string {
  return `Word cloud with ${descriptor.words.length} terms`;
}

export function chartA11ySummary(descriptor: {
  kind: string;
  title?: string;
}): string {
  switch (descriptor.kind) {
    case "cartesian":
      return (descriptor as { title?: string }).title ?? "Chart";
    case "single-value":
      return singleValueA11ySummary(descriptor as SingleValueA11yDescriptor);
    case "pie":
      return pieA11ySummary(descriptor as PieA11yDescriptor);
    case "candlestick":
      return candlestickA11ySummary(descriptor as CandlestickA11yDescriptor);
    case "heatmap":
      return heatmapA11ySummary(descriptor as HeatmapA11yDescriptor);
    case "calendar":
      return calendarHeatmapA11ySummary(descriptor as CalendarHeatmapA11yDescriptor);
    case "funnel":
      return funnelA11ySummary(descriptor as FunnelA11yDescriptor);
    case "pictorial-bar":
      return pictorialBarA11ySummary(descriptor as PictorialBarA11yDescriptor);
    case "hierarchy":
      return hierarchyA11ySummary(descriptor as HierarchyA11yDescriptor);
    case "parallel":
      return parallelA11ySummary(descriptor as ParallelA11yDescriptor);
    case "theme-river":
      return themeRiverA11ySummary(descriptor as ThemeRiverA11yDescriptor);
    case "bump":
      return bumpA11ySummary(descriptor as BumpA11yDescriptor);
    case "word-cloud":
      return wordCloudA11ySummary(descriptor as WordCloudA11yDescriptor);
    default:
      return "Chart";
  }
}

function formatShare(value: number, total: number): string {
  if (total <= 0) {
    return "0%";
  }
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function formatPieShare(value: number, slices: { value: number }[]): string {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  return formatShare(value, total);
}

export function formatFunnelShare(value: number, stages: { value: number }[]): string {
  const total = stages.reduce((sum, stage) => sum + stage.value, 0);
  return formatShare(value, total);
}
