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
