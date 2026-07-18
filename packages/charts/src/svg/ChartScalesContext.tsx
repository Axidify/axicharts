"use client";

import {
  createContext,
  useContext,
  type ReactElement,
  type ReactNode,
} from "react";
import type { PlotRect } from "./scales";
import {
  areaPath,
  linePath,
  plotRect,
  xAt as scaleXAt,
  yAt as scaleYAt,
} from "./scales";

export type ChartScales = {
  width: number;
  height: number;
  plot: PlotRect;
  categories: string[];
  yMin: number;
  yMax: number;
  xAt: (index: number) => number;
  yAt: (value: number) => number;
  linePath: (values: number[]) => string;
  areaPath: (values: number[]) => string;
};

const ChartScalesContext = createContext<ChartScales | null>(null);

export function buildChartScales({
  width,
  height,
  categories,
  yMin,
  yMax,
}: {
  width: number;
  height: number;
  categories: string[];
  yMin: number;
  yMax: number;
}): ChartScales {
  const plot = plotRect(width, height);
  const count = categories.length;

  return {
    width,
    height,
    plot,
    categories,
    yMin,
    yMax,
    xAt: (index) => scaleXAt(index, count, plot),
    yAt: (value) => scaleYAt(value, yMin, yMax, plot),
    linePath: (values) => linePath(values, yMin, yMax, plot),
    areaPath: (values) => areaPath(values, yMin, yMax, plot),
  };
}

export function ChartScalesProvider({
  value,
  children,
}: {
  value: ChartScales;
  children: ReactNode;
}): ReactElement {
  return (
    <ChartScalesContext.Provider value={value}>
      {children}
    </ChartScalesContext.Provider>
  );
}

/**
 * Plot coordinate helpers for static SVG cartesian charts.
 * Only available inside `renderPath` / `renderBar` callbacks (static mode).
 */
export function useChartScales(): ChartScales {
  const scales = useContext(ChartScalesContext);
  if (!scales) {
    throw new Error(
      "useChartScales must be used within a static SVG cartesian chart render callback",
    );
  }
  return scales;
}
