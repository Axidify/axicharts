export type ChartAnimatePreset = "none" | "enter" | "update";

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

export type CountUpMotionConfig = {
  duration: number;
  easing?: string;
};

export type ChartAnimateEnterConfig = {
  duration?: number;
  easing?: string;
  delay?: number;
  /** Per-series delay offset for stagger presets (ms). */
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

export type ResolvedChartAnimate = {
  enter: ChartAnimateEnterConfig | null;
  update: ChartAnimateUpdateConfig | null;
};

export type CartesianMotionKind = "line" | "bar" | "area" | "combo";

/** Live-mode wholesale data replace animation — separate from `ChartAnimate`. */
export type LiveAnimate = "none" | "crossfade";
