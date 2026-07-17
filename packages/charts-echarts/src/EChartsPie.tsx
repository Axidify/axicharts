"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import {
  axisLabelStyle,
  gridOptions,
  splitLineStyle,
  toneColor,
} from "./themeBridge";
import { useEChart } from "./useEChart";
import { SERIES_PALETTE, type PieSlice } from "./types";

export type EChartsPieProps = {
  width: number;
  height: number;
  slices: PieSlice[];
  theme: ChartTheme;
  innerRadius?: number;
  showLabels?: boolean;
};

export function EChartsPie({
  width,
  height,
  slices,
  theme,
  innerRadius = 0,
  showLabels = true,
}: EChartsPieProps): ReactElement {
  const data = slices.map((slice, index) => ({
    name: slice.name,
    value: slice.value,
    itemStyle: {
      color: toneColor(slice.tone) ?? SERIES_PALETTE[index % SERIES_PALETTE.length],
    },
  }));

  const option: EChartsOption = {
    grid: gridOptions(theme),
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: innerRadius > 0 ? [`${innerRadius}%`, "70%"] : "70%",
        center: ["50%", "50%"],
        data,
        label: {
          show: showLabels,
          formatter: "{b}: {d}%",
          fontSize: 11,
        },
        labelLine: { show: showLabels },
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
