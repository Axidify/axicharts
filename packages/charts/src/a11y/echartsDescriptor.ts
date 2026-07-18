import type { HeatmapMatrix, OhlcPoint, PieSlice } from "@axicharts/charts-echarts";
import type { FunnelStage } from "@axicharts/charts-echarts";
import type { HierarchyNode } from "@axicharts/charts-echarts";
import type {
  CandlestickA11yDescriptor,
  FunnelA11yDescriptor,
  HeatmapA11yDescriptor,
  HierarchyA11yDescriptor,
  HierarchyA11yItem,
  PieA11yDescriptor,
  SingleValueA11yDescriptor,
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

export function pieA11ySummary(descriptor: PieA11yDescriptor): string {
  return `${descriptor.chartType} chart with ${descriptor.slices.length} segments`;
}

export function candlestickA11ySummary(descriptor: CandlestickA11yDescriptor): string {
  return `Candlestick chart with ${descriptor.categories.length} periods`;
}

export function heatmapA11ySummary(descriptor: HeatmapA11yDescriptor): string {
  return `Heatmap with ${descriptor.xCategories.length} columns and ${descriptor.yCategories.length} rows`;
}

export function funnelA11ySummary(descriptor: FunnelA11yDescriptor): string {
  return `Funnel chart with ${descriptor.stages.length} stages`;
}

export function hierarchyA11ySummary(descriptor: HierarchyA11yDescriptor): string {
  return `${descriptor.chartType} chart with ${descriptor.items.length} leaf nodes`;
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
    case "funnel":
      return funnelA11ySummary(descriptor as FunnelA11yDescriptor);
    case "hierarchy":
      return hierarchyA11ySummary(descriptor as HierarchyA11yDescriptor);
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
