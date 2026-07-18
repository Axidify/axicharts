export type ChartAnimatePreset = "none" | "enter" | "update";

export type ChartAnimateEnterConfig = {
  duration?: number;
  easing?: string;
  delay?: number;
};

export type ChartAnimateUpdateConfig = {
  duration?: number;
  easing?: boolean | { duration?: number };
};

export type ChartAnimateConfig = {
  enter?: ChartAnimateEnterConfig | false;
  update?: ChartAnimateUpdateConfig | false;
};

export type ChartAnimate = ChartAnimatePreset | ChartAnimateConfig;

export type ResolvedChartAnimate = {
  enter: ChartAnimateEnterConfig | null;
  update: ChartAnimateUpdateConfig | null;
};

export type CartesianMotionKind = "line" | "bar" | "area" | "combo";
