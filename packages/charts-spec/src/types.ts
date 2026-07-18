export const SPEC_VERSION = 1;

export type ThemeName = "clean" | "live" | "industrial" | "presentation";

export type ChartMode = "static" | "interactive" | "live" | "presentation";

export type FieldFormat = "number" | "currency" | "percent" | "compact";

export type FieldType = "nominal" | "temporal" | "quantitative";

export type FieldEncoding = {
  field: string;
  type?: FieldType;
  format?: FieldFormat;
  label?: string;
};

/** Color channel for per-mark styling (AI / spec compiler). */
export type ColorEncoding = {
  field: string;
  type?: "nominal" | "quantitative" | "semantic";
};

export type PanelChartType =
  | "line"
  | "area"
  | "bar"
  | "pie"
  | "donut"
  | "funnel"
  | "waterfall"
  | "candlestick"
  | "heatmap"
  | "scatter"
  | "treemap"
  | "stat"
  | "gauge"
  | "table"
  | string;

export type PanelSpec = {
  specVersion?: number;
  type: PanelChartType;
  title?: string;
  encoding?: {
    x?: FieldEncoding;
    y?: FieldEncoding | FieldEncoding[];
    color?: ColorEncoding;
    name?: FieldEncoding;
    value?: FieldEncoding;
    open?: FieldEncoding;
    high?: FieldEncoding;
    low?: FieldEncoding;
    close?: FieldEncoding;
  };
  props?: Record<string, unknown>;
  theme?: ThemeName;
  mode?: ChartMode;
  height?: number;
  width?: number | string;
  valueSuffix?: string;
  fill?: boolean;
  stacked?: boolean;
  innerRadius?: number;
};

export type MetricKind = "gauge" | "counter" | "histogram" | "ohlc" | "distribution";

export type MetricProfile = {
  name: string;
  tags?: Record<string, string>;
  unit?: string;
  kind?: MetricKind;
};

export type DataProfile = {
  metrics: MetricProfile[];
};

export type SpecData = Record<string, unknown>[] | Record<string, unknown>;

export type TemplateId =
  | "finance-pnl"
  | "trading-blotter"
  | "capacity-grid"
  | "ops-2x2"
  | "line-overview"
  | "plugins-wall"
  | "program-dashboard";

export type DashboardSpec = {
  specVersion?: number;
  template: TemplateId;
  title?: string;
  subtitle?: string;
  theme?: ThemeName;
  mode?: ChartMode;
  data: Record<string, unknown>;
};
