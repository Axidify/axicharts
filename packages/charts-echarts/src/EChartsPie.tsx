"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import { gridOptions, hiddenTooltip, seriesPalette, toneColor } from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import type { PieSlice } from "./types";

export type EChartsPieProps = {
  width: number;
  height: number;
  slices: PieSlice[];
  theme: ChartTheme;
  innerRadius?: number;
  showLabels?: boolean;
  animate?: boolean;
  mergeOption?: boolean;
  graphics?: ChartGraphicElement[];
  onItemHover?: (event: EChartItemHoverEvent) => void;
};

export function EChartsPie({
  width,
  height,
  slices,
  theme,
  innerRadius = 0,
  showLabels = true,
  animate = false,
  mergeOption,
  graphics,
  onItemHover,
}: EChartsPieProps): ReactElement {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  const palette = seriesPalette(theme);
  const data = slices.map((slice, index) => ({
    name: slice.name,
    value: slice.value,
    itemStyle: {
      color:
        slice.color ??
        toneColor(slice.tone, theme) ??
        palette[index % palette.length],
    },
  }));

  const option: EChartsOption = withPresentationAnimation(
    {
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
    },
    animate,
  );

  const rootRef = useEChart({
    option,
    graphics,
    width,
    height,
    onItemHover,
    mergeOption: mergeOption ?? !animate,
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
