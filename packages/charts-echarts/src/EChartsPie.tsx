"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import { gridOptions, hiddenTooltip, toneColor } from "./themeBridge";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import { SERIES_PALETTE, type PieSlice } from "./types";

export type EChartsPieProps = {
  width: number;
  height: number;
  slices: PieSlice[];
  theme: ChartTheme;
  innerRadius?: number;
  showLabels?: boolean;
  onItemHover?: (event: EChartItemHoverEvent) => void;
};

export function EChartsPie({
  width,
  height,
  slices,
  theme,
  innerRadius = 0,
  showLabels = true,
  onItemHover,
}: EChartsPieProps): ReactElement {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  const data = slices.map((slice, index) => ({
    name: slice.name,
    value: slice.value,
    itemStyle: {
      color:
        slice.color ??
        toneColor(slice.tone) ??
        SERIES_PALETTE[index % SERIES_PALETTE.length],
    },
  }));

  const option: EChartsOption = {
    grid: gridOptions(theme),
    tooltip: hiddenTooltip(),
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

  const rootRef = useEChart({
    option,
    width,
    height,
    onItemHover,
    formatItemHover: (params) => {
      const mouse = params.event?.event;
      if (!mouse || params.name == null) return null;
      const value = typeof params.value === "number" ? params.value : 0;
      const share = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
      return {
        title: params.name,
        rows: [
          {
            label: "Value",
            value: String(value),
            color: params.color,
          },
          {
            label: "Share",
            value: `${share}%`,
          },
        ],
        left: mouse.offsetX,
        top: mouse.offsetY,
      };
    },
  });

  return (
    <div
      ref={rootRef}
      className="axicharts-echarts"
      style={{ width, height, background: "transparent" }}
    />
  );
}
