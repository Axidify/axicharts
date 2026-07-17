"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import { axisLabelStyle, gridOptions, splitLineStyle } from "./themeBridge";
import { useEChart } from "./useEChart";
import type { HeatmapMatrix } from "./types";

export type EChartsHeatmapProps = {
  width: number;
  height: number;
  matrix: HeatmapMatrix;
  theme: ChartTheme;
  min?: number;
  max?: number;
};

export function EChartsHeatmap({
  width,
  height,
  matrix,
  theme,
  min,
  max,
}: EChartsHeatmapProps): ReactElement {
  const flat = matrix.values.flat();
  const computedMin = min ?? Math.min(...flat);
  const computedMax = max ?? Math.max(...flat);

  const data: [number, number, number][] = [];
  matrix.values.forEach((row, yIndex) => {
    row.forEach((value, xIndex) => {
      data.push([xIndex, yIndex, value]);
    });
  });

  const option: EChartsOption = {
    grid: gridOptions(theme),
    tooltip: {
      position: "top",
      formatter: (params) => {
        const row = Array.isArray(params) ? params[0] : params;
        if (!row || !Array.isArray(row.data)) return "";
        const [x, y, value] = row.data as [number, number, number];
        return `${matrix.xCategories[x]} / ${matrix.yCategories[y]}: ${value}`;
      },
    },
    xAxis: {
      type: "category",
      data: matrix.xCategories,
      axisLabel: axisLabelStyle(theme),
      splitLine: splitLineStyle(theme),
    },
    yAxis: {
      type: "category",
      data: matrix.yCategories,
      axisLabel: axisLabelStyle(theme),
      splitLine: splitLineStyle(theme),
    },
    visualMap: {
      min: computedMin,
      max: computedMax,
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      inRange: {
        color: ["#eff6ff", "#3b82f6", "#1e3a8a"],
      },
      textStyle: { fontSize: 10, color: "#64748b" },
    },
    series: [
      {
        type: "heatmap",
        data,
        label: { show: width > 360, fontSize: 10 },
        emphasis: {
          itemStyle: { shadowBlur: 6, shadowColor: "rgba(0,0,0,0.2)" },
        },
      },
    ],
  };

  const rootRef = useEChart({ option, width, height });

  return (
    <div
      ref={rootRef}
      className="axicharts-echarts"
      style={{ width, height, background: "transparent" }}
    />
  );
}
