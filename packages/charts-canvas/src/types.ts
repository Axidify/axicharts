import type { ChartTheme } from "@axicharts/charts-theme";
import type { LineCurve } from "@axicharts/charts-theme";

export type SeriesTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "critical";

export type PlotSeries = {
  name: string;
  data: number[];
  key?: string;
  color?: string;
  tone?: SeriesTone;
  /** Per-category colors (bar fills, line/area segment + point stroke) — length matches `data`. */
  fills?: string[];
  /** Per-category sizes — bar width fraction (0–1) or point radius in px. */
  sizes?: number[];
};

export type ComboSeriesKind = "line" | "bar";

export type ComboSeries = PlotSeries & {
  kind: ComboSeriesKind;
};

export type ReferenceLine = {
  value: number;
  label?: string;
  tone?: SeriesTone;
};

export type ThresholdBand = {
  min: number;
  max: number;
  label?: string;
  tone?: SeriesTone;
};

export type DualAxisMode = boolean | "auto";

export type PlotCursorEvent = {
  index: number;
  left: number;
  top: number;
} | null;

export type UPlotLineProps = {
  width: number;
  height: number;
  categories: string[];
  series: PlotSeries[];
  theme: ChartTheme;
  curve?: LineCurve;
  fill?: boolean;
  showAxes?: boolean;
  valueSuffix?: string;
  dualAxis?: DualAxisMode;
  stacked?: boolean;
  thresholdBands?: ThresholdBand[];
  referenceLines?: ReferenceLine[];
  showCursor?: boolean;
  useNativeLegend?: boolean;
  onCursor?: (event: PlotCursorEvent) => void;
  onSyncIndex?: (index: number | null) => void;
  syncIndex?: number | null;
  syncSourceId?: string | null;
  chartId?: string;
};

export type UPlotBarProps = {
  width: number;
  height: number;
  categories: string[];
  series: PlotSeries[];
  theme: ChartTheme;
  showAxes?: boolean;
  showValues?: boolean;
  valueSuffix?: string;
  referenceLines?: ReferenceLine[];
  stacked?: boolean;
  thresholdBands?: ThresholdBand[];
  showCursor?: boolean;
  useNativeLegend?: boolean;
  onCursor?: (event: PlotCursorEvent) => void;
  onSyncIndex?: (index: number | null) => void;
  syncIndex?: number | null;
  syncSourceId?: string | null;
  chartId?: string;
};

export type UPlotComboProps = {
  width: number;
  height: number;
  categories: string[];
  series: ComboSeries[];
  theme: ChartTheme;
  curve?: LineCurve;
  fill?: boolean;
  showAxes?: boolean;
  showValues?: boolean;
  valueSuffix?: string;
  dualAxis?: DualAxisMode;
  referenceLines?: ReferenceLine[];
  thresholdBands?: ThresholdBand[];
  showCursor?: boolean;
  useNativeLegend?: boolean;
  onCursor?: (event: PlotCursorEvent) => void;
  onSyncIndex?: (index: number | null) => void;
  syncIndex?: number | null;
  syncSourceId?: string | null;
  chartId?: string;
};
