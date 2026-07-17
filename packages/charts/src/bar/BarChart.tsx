"use client";

import type { ReactElement } from "react";
import {
  UPlotBar,
  type PlotSeries,
  type ReferenceLine,
} from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";

export type BarChartProps = {
  categories: string[];
  series: PlotSeries[];
  showAxes?: boolean;
  showValues?: boolean;
  valueSuffix?: string;
  referenceLines?: ReferenceLine[];
};

export function BarChart({
  categories,
  series,
  showAxes,
  showValues = false,
  valueSuffix,
  referenceLines,
}: BarChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const axes = showAxes ?? theme.axis.show;

  return (
    <div
      aria-label={series.map((item) => item.name).join(", ")}
      style={{
        width: size.width,
        height: size.height,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <UPlotBar
        width={Math.floor(size.width)}
        height={Math.floor(size.height)}
        categories={categories}
        series={series}
        theme={theme}
        showAxes={axes}
        showValues={showValues}
        valueSuffix={valueSuffix}
        referenceLines={referenceLines}
      />
      {valueSuffix && theme.caption.show ? (
        <span
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
          }}
        >
          Values shown in {valueSuffix.trim()}
        </span>
      ) : null}
    </div>
  );
}
