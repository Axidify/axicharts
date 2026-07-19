import type { ChartGraphicElement } from "@axicharts/charts-canvas";

export const SPEC_VERSION = 1;

export type ThemeName = "clean" | "live" | "industrial" | "presentation" | "studio";

export type ChartMode = "static" | "interactive" | "live" | "presentation";

export type FieldFormat = "number" | "currency" | "percent" | "compact";

export type FieldType = "nominal" | "temporal" | "quantitative";

export type FieldEncoding = {
  field: string;
  type?: FieldType;
  format?: FieldFormat;
  label?: string;
  /** Combo panels — mark kind for this y channel. */
  kind?: "line" | "bar" | "area";
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

export type ChartBlockSeriesMark = {
  type: "line" | "bar" | "area";
  /** Quantitative field on each row. */
  field: string;
  label?: string;
  tone?: "default" | "info" | "success" | "warning" | "critical";
  yAxisId?: "left" | "right";
  /** Shared stack id — bars with the same id stack (panel `stacked` when 2+ bars share id). */
  stack?: string;
  /** Bar value labels (maps to chart `showValues` when any bar mark sets true). */
  labels?: boolean;
  curve?: "linear" | "monotone";
};

export type ChartBlockRuleMark = {
  type: "rule";
  value: number;
  label?: string;
  tone?: "default" | "info" | "success" | "warning" | "critical";
  orientation?: "horizontal" | "vertical";
};

export type ChartBlockBandMark = {
  type: "band";
  min: number;
  max: number;
  label?: string;
  tone?: "default" | "info" | "success" | "warning" | "critical";
};

/** Mix-and-match cartesian building blocks — compiles to ComboChart + overlays. */
export type ChartBlockMarkSpec =
  | ChartBlockSeriesMark
  | ChartBlockRuleMark
  | ChartBlockBandMark;

export type PanelChartType =
  | "line"
  | "area"
  | "bar"
  | "blocks"
  | "cartesian"
  | "combo"
  | "pie"
  | "donut"
  | "funnel"
  | "pictorial-bar"
  | "pictorialBar"
  | "waterfall"
  | "candlestick"
  | "heatmap"
  | "calendar"
  | "calendar-heatmap"
  | "radar"
  | "parallel"
  | "theme-river"
  | "bump"
  | "bump-chart"
  | "graph"
  | "network"
  | "wordcloud"
  | "word-cloud"
  | "scatter"
  | "treemap"
  | "sunburst"
  | "boxplot"
  | "violin"
  | "swarm"
  | "beeswarm"
  | "ridgeline"
  | "joyplot"
  | "histogram"
  | "stat"
  | "gauge"
  | "digital"
  | "status-lamp"
  | "statusLamp"
  | "liquid-fill"
  | "liquidFill"
  | "table"
  | "markdown"
  | "text"
  | "navigator"
  | "sankey"
  | "geo"
  | "map"
  | "gantt"
  | "echarts"
  | string;

export type PanelSpec = {
  specVersion?: number;
  type: PanelChartType;
  title?: string;
  encoding?: {
    x?: FieldEncoding;
    y?: FieldEncoding | FieldEncoding[];
    date?: FieldEncoding;
    color?: ColorEncoding;
    size?: SizeEncoding;
    name?: FieldEncoding;
    value?: FieldEncoding;
    category?: FieldEncoding;
    open?: FieldEncoding;
    high?: FieldEncoding;
    low?: FieldEncoding;
    close?: FieldEncoding;
    series?: FieldEncoding;
    source?: FieldEncoding;
    target?: FieldEncoding;
  };
  props?: Record<string, unknown>;
  theme?: ThemeName;
  mode?: ChartMode;
  height?: number;
  width?: number | string;
  valueSuffix?: string;
  fill?: boolean;
  stacked?: boolean;
  /** Bar value labels on cartesian/combo panels. */
  showValues?: boolean;
  innerRadius?: number;
  /**
   * Cartesian building blocks — line/bar/area series plus rule/band overlays.
   * Requires `type: "cartesian"` (or legacy `"blocks"`) and `encoding.x`.
   */
  marks?: ChartBlockMarkSpec[];
  /** Declarative cartesian annotations — labels, bands, lines, markers. */
  annotations?: AnnotationSpec[];
  /** ECharts-style graphic overlay elements (separate from annotations). */
  graphics?: ChartGraphicElement[];
  /** Chart-level animation — also accepted as `props.animation`. */
  animation?: ChartAnimate;
  /** Live-mode wholesale replace crossfade — also accepted as `props.liveAnimate`. */
  liveAnimate?: LiveAnimate;
};

export type ChartMotionPresetName =
  | "stagger"
  | "spring"
  | "gentle"
  | "morph"
  | "countUp";

export type CartesianMotionPresetName = Exclude<
  ChartMotionPresetName,
  "countUp"
>;

export type ChartAnimatePreset = "none" | "enter" | "update";

export type ChartAnimateEnterConfig = {
  duration?: number;
  easing?: string;
  delay?: number;
  staggerMs?: number;
};

export type ChartAnimateUpdateConfig = {
  duration?: number;
  easing?: boolean | { duration?: number };
};

export type ChartAnimateConfig = {
  enter?: ChartAnimateEnterConfig | false;
  update?: ChartAnimateUpdateConfig | false;
};

export type ChartAnimate =
  | ChartAnimatePreset
  | CartesianMotionPresetName
  | ChartAnimateConfig;

export type LiveAnimate = "none" | "crossfade";

export type AnnotationSpec =
  | {
      type: "label";
      text: string;
      x?: number | string;
      y: number;
      tone?: "default" | "info" | "success" | "warning" | "critical";
      position?: "top" | "bottom" | "left" | "right" | "center";
      id?: string;
    }
  | {
      type: "band";
      min: number;
      max: number;
      label?: string;
      tone?: "default" | "info" | "success" | "warning" | "critical";
      id?: string;
    }
  | {
      type: "line";
      value: number;
      label?: string;
      tone?: "default" | "info" | "success" | "warning" | "critical";
      orientation?: "horizontal" | "vertical";
      x?: number | string;
      id?: string;
    }
  | {
      type: "marker";
      x?: number | string;
      y: number;
      label?: string;
      tone?: "default" | "info" | "success" | "warning" | "critical";
      draggable?: boolean;
      id?: string;
    };

export type MetricKind = "gauge" | "counter" | "histogram" | "ohlc" | "distribution";

export type FieldRole = "time" | "dimension" | "measure" | "identifier";

export type FieldProfile = {
  name: string;
  role: FieldRole;
  format?: FieldFormat;
};

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
  /** C148a — semantic roles for tabular / agent planners. */
  fieldProfiles?: FieldProfile[];
  /** C165 — row grain inferred from identifiers + time columns. */
  grain?: TabularGrain;
  /** C165 — min/max on the primary time field when parseable. */
  timeSpan?: TimeSpan;
  /** C165 — distinct value counts for dimension / time / identifier fields. */
  cardinalities?: Record<string, number>;
};

export type TabularGrain = "transaction" | "entity" | "daily" | "unknown";

export type TimeSpan = {
  field: string;
  from: string;
  to: string;
};

export type SpecData = Record<string, unknown>[] | Record<string, unknown>;

export type BuiltinTemplateId =
  | "finance-pnl"
  | "trading-blotter"
  | "capacity-grid"
  | "ops-2x2"
  | "line-overview"
  | "plugins-wall"
  | "program-dashboard"
  | "sre-incident"
  | "saas-growth";

/** Builtin ids plus any id registered via `registerDashboardTemplate`. */
export type TemplateId = BuiltinTemplateId | (string & {});

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
