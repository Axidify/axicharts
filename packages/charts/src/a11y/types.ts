export type CartesianA11ySeries = {
  name: string;
  values: number[];
};

export type CartesianA11yDescriptor = {
  kind: "cartesian";
  chartType: "line" | "bar" | "area" | "combo";
  title?: string;
  description?: string;
  categoryLabel?: string;
  categories: string[];
  series: CartesianA11ySeries[];
};

export type SingleValueA11yDescriptor = {
  kind: "single-value";
  title: string;
  value: string;
  description?: string;
};

export type PieA11ySlice = {
  name: string;
  value: number;
};

export type PieA11yDescriptor = {
  kind: "pie";
  chartType: "pie" | "donut";
  title?: string;
  description?: string;
  slices: PieA11ySlice[];
};

export type CandlestickA11yPoint = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type CandlestickA11yDescriptor = {
  kind: "candlestick";
  title?: string;
  description?: string;
  categories: string[];
  data: CandlestickA11yPoint[];
};

export type HeatmapA11yDescriptor = {
  kind: "heatmap";
  title?: string;
  description?: string;
  xLabel?: string;
  yLabel?: string;
  xCategories: string[];
  yCategories: string[];
  values: number[][];
};

export type CalendarHeatmapA11yDescriptor = {
  kind: "calendar";
  title?: string;
  description?: string;
  year?: number;
  points: { date: string; value: number }[];
};

export type FunnelA11yStage = {
  name: string;
  value: number;
};

export type FunnelA11yDescriptor = {
  kind: "funnel";
  title?: string;
  description?: string;
  stages: FunnelA11yStage[];
};

export type PictorialBarA11yItem = {
  category: string;
  value: number;
};

export type PictorialBarA11yDescriptor = {
  kind: "pictorial-bar";
  title?: string;
  description?: string;
  items: PictorialBarA11yItem[];
};

export type HierarchyA11yItem = {
  name: string;
  value: number;
  path?: string;
};

export type HierarchyA11yDescriptor = {
  kind: "hierarchy";
  chartType: "treemap" | "sunburst";
  title?: string;
  description?: string;
  items: HierarchyA11yItem[];
};

export type ParallelA11yDescriptor = {
  kind: "parallel";
  title?: string;
  description?: string;
  dimensions: string[];
  series: { name: string; values: number[] }[];
};

export type ThemeRiverA11yDescriptor = {
  kind: "theme-river";
  title?: string;
  description?: string;
  points: { time: string | number; value: number; series: string }[];
};

export type BumpA11yDescriptor = {
  kind: "bump";
  title?: string;
  description?: string;
  categories: string[];
  series: { name: string; ranks: number[] }[];
};

export type GraphA11yDescriptor = {
  kind: "graph";
  title?: string;
  description?: string;
  nodes: { id: string; name: string; value?: number }[];
  edges: { source: string; target: string; value?: number }[];
};

export type WordCloudA11yDescriptor = {
  kind: "word-cloud";
  title?: string;
  description?: string;
  words: { text: string; value: number }[];
};

export type ChartA11yDescriptor =
  | CartesianA11yDescriptor
  | SingleValueA11yDescriptor
  | PieA11yDescriptor
  | CandlestickA11yDescriptor
  | HeatmapA11yDescriptor
  | CalendarHeatmapA11yDescriptor
  | FunnelA11yDescriptor
  | PictorialBarA11yDescriptor
  | HierarchyA11yDescriptor
  | ParallelA11yDescriptor
  | ThemeRiverA11yDescriptor
  | BumpA11yDescriptor
  | GraphA11yDescriptor
  | WordCloudA11yDescriptor;

export type ChartA11yTable = {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, string | number>[];
  caption?: string;
};
