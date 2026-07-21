import type { ChartTheme } from "@axicharts/charts-theme";
import type { LineCurve } from "@axicharts/charts-theme";
import type {
  ChartAnnotation,
  PlotLabelAnnotation,
  PlotMarkerAnnotation,
  PlotVerticalLine,
} from "./annotations";

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
  /** Per-series area fill (overrides chart-level `fill` for this series). */
  fill?: boolean;
  /** Per-series line curve (overrides chart-level `curve` for this series). */
  curve?: LineCurve;
  /** Show point markers (RFC-002 `point` mark). */
  showPoints?: boolean;
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
  annotations?: ChartAnnotation[];
  verticalLines?: PlotVerticalLine[];
  plotLabels?: PlotLabelAnnotation[];
  plotMarkers?: PlotMarkerAnnotation[];
  showCursor?: boolean;
  useNativeLegend?: boolean;
  onCursor?: (event: PlotCursorEvent) => void;
  onSyncIndex?: (index: number | null) => void;
  syncIndex?: number | null;
  syncSourceId?: string | null;
  chartId?: string;
};

export type BarOrientation = "vertical" | "horizontal";

export type UPlotBarProps = {
  width: number;
  height: number;
  categories: string[];
  series: PlotSeries[];
  theme: ChartTheme;
  orientation?: BarOrientation;
  showAxes?: boolean;
  showValues?: boolean;
  valueSuffix?: string;
  referenceLines?: ReferenceLine[];
  stacked?: boolean;
  thresholdBands?: ThresholdBand[];
  annotations?: ChartAnnotation[];
  verticalLines?: PlotVerticalLine[];
  plotLabels?: PlotLabelAnnotation[];
  plotMarkers?: PlotMarkerAnnotation[];
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
  stacked?: boolean;
  referenceLines?: ReferenceLine[];
  thresholdBands?: ThresholdBand[];
  annotations?: ChartAnnotation[];
  verticalLines?: PlotVerticalLine[];
  plotLabels?: PlotLabelAnnotation[];
  plotMarkers?: PlotMarkerAnnotation[];
  showCursor?: boolean;
  useNativeLegend?: boolean;
  onCursor?: (event: PlotCursorEvent) => void;
  onSyncIndex?: (index: number | null) => void;
  syncIndex?: number | null;
  syncSourceId?: string | null;
  chartId?: string;
};
