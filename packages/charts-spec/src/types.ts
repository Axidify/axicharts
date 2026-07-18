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
  /** Combo panels — mark kind for this y channel. */
  kind?: "line" | "bar";
};

/** Color channel for per-mark styling (AI / spec compiler). */
export type ColorEncoding = {
  field: string;
  type?: "nominal" | "quantitative" | "semantic";
};

/** Size channel — bar width fraction or point radius (px) by field. */
export type SizeEncoding = {
  field: string;
  type?: "nominal" | "quantitative";
  /** Scaled output range: bar width multiplier or point radius in px. */
  range?: [number, number];
};

/** Per-panel style overrides — AI-tunable without forking the global theme. */
/** shadcn-compatible series labels/colors for ChartContainer.config */
export type ChartConfigEntrySpec = {
  label?: string;
  color?: string;
  tone?: "default" | "success" | "warning" | "critical" | "info";
};

export type ChartConfigSpec = Record<string, ChartConfigEntrySpec>;

export type PanelStyleSpec = {
  grid?: {
    opacity?: number;
    strokeWidth?: number;
    horizontal?: boolean;
    vertical?: boolean;
  };
  line?: {
    strokeWidth?: number;
    curve?: "linear" | "monotone";
  };
  area?: {
    fillOpacity?: number;
  };
  bar?: {
    radius?: number;
    gap?: number;
  };
};

export type PanelChartType =
  | "line"
  | "area"
  | "bar"
  | "combo"
  | "pie"
  | "donut"
  | "funnel"
  | "waterfall"
  | "candlestick"
  | "heatmap"
  | "scatter"
  | "treemap"
  | "boxplot"
  | "histogram"
  | "stat"
  | "gauge"
  | "table"
  | "markdown"
  | "text"
  | string;

export type PanelSpec = {
  specVersion?: number;
  type: PanelChartType;
  title?: string;
  encoding?: {
    x?: FieldEncoding;
    y?: FieldEncoding | FieldEncoding[];
    color?: ColorEncoding;
    size?: SizeEncoding;
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
  /** Known row fields from data profiling — used to infer encoding.color and encoding.size. */
  fields?: string[];
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
  chartConfig?: ChartConfigSpec;
};
