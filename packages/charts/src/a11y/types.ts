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

export type ChartA11yDescriptor =
  | CartesianA11yDescriptor
  | SingleValueA11yDescriptor
  | PieA11yDescriptor
  | CandlestickA11yDescriptor
  | HeatmapA11yDescriptor
  | FunnelA11yDescriptor
  | HierarchyA11yDescriptor;

export type ChartA11yTable = {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, string | number>[];
  caption?: string;
};
