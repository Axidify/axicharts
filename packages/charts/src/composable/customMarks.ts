import type { ReactElement } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import type { ChartScales } from "../svg/ChartScalesContext";

export type PathRenderContext = ChartScales & {
  series: PlotSeries;
  seriesIndex: number;
  color: string;
  fill: boolean;
  defaultPath: string;
};

export type BarRenderContext = ChartScales & {
  series: PlotSeries;
  seriesIndex: number;
  categoryIndex: number;
  category: string;
  value: number;
  color: string;
  bar: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type PathRenderFn = (ctx: PathRenderContext) => ReactElement;
export type BarRenderFn = (ctx: BarRenderContext) => ReactElement;

export type CartesianPlotSeries = PlotSeries & {
  /** Static SVG only — custom path renderer for line/area marks. */
  renderPath?: PathRenderFn;
  /** Static SVG only — custom bar renderer for bar marks. */
  renderBar?: BarRenderFn;
};
