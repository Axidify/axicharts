"use client";

import type { ReactElement } from "react";
import { UPlotLine, type PlotSeries } from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";

export type LineChartProps = {
  categories: string[];
  series: PlotSeries[];
  fill?: boolean;
  showAxes?: boolean;
  valueSuffix?: string;
  dualAxis?: boolean | "auto";
};

export function LineChart({
  categories,
  series,
  fill = false,
  showAxes,
  valueSuffix,
  dualAxis = "auto",
}: LineChartProps): ReactElement | null {
  const { size, ready, theme, mode } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const compact = size.height < 72;
  const axes =
    showAxes ?? (theme.axis.show && !compact);

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
      <UPlotLine
        width={Math.floor(size.width)}
        height={Math.floor(size.height)}
        categories={categories}
        series={series}
        theme={theme}
        fill={fill}
        showAxes={axes}
        valueSuffix={valueSuffix}
        dualAxis={dualAxis}
      />
      {valueSuffix && theme.caption.show && !compact ? (
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
      {mode === "live" ? (
        <span
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
          }}
        >
          Live chart
        </span>
      ) : null}
    </div>
  );
}
