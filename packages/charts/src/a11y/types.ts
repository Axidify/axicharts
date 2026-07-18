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

export type ChartA11yDescriptor = CartesianA11yDescriptor | SingleValueA11yDescriptor;

export type ChartA11yTable = {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, string | number>[];
  caption?: string;
};
