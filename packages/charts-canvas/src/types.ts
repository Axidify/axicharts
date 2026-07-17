import type { ChartTheme } from "@axicharts/charts-theme";

export type SeriesTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "critical";

export type PlotSeries = {
  name: string;
  data: number[];
  tone?: SeriesTone;
};

export type ReferenceLine = {
  value: number;
  label?: string;
  tone?: SeriesTone;
};

export type UPlotLineProps = {
  width: number;
  height: number;
  categories: string[];
  series: PlotSeries[];
  theme: ChartTheme;
  fill?: boolean;
  showAxes?: boolean;
  valueSuffix?: string;
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
};
