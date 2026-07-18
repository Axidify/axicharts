"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import {
  axisLabelStyle,
  gridOptions,
  hiddenTooltip,
  splitLineStyle,
  seriesPalette,
  toneColor,
} from "./themeBridge";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import type { ScatterSeries } from "./scatterTypes";

export type EChartsScatterProps = {
  width: number;
  height: number;
  series: ScatterSeries[];
  theme: ChartTheme;
  showAxes?: boolean;
  xSuffix?: string;
  ySuffix?: string;
  onItemHover?: (event: EChartItemHoverEvent) => void;
};

function formatCoord(value: number, suffix = ""): string {
  const rounded =
    Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded}${suffix}`;
}

export function EChartsScatter({
  width,
  height,
  series,
  theme,
  showAxes = true,
  xSuffix = "",
  ySuffix = "",
  onItemHover,
}: EChartsScatterProps): ReactElement {
  const showLegend = series.length > 1;
  const grid = {
    ...gridOptions(theme),
    top: showLegend ? 28 : gridOptions(theme).top,
  };

  const palette = seriesPalette(theme);
  const option: EChartsOption = {
    grid,
    legend: showLegend
      ? {
          show: true,
          top: 0,
          textStyle: { color: axisLabelStyle(theme).color, fontSize: 11 },
        }
      : { show: false },
    tooltip: hiddenTooltip(),
    xAxis: {
      type: "value",
      scale: true,
      show: showAxes,
      axisLabel: axisLabelStyle(theme),
      splitLine: splitLineStyle(theme),
    },
    yAxis: {
      type: "value",
      scale: true,
      show: showAxes,
      axisLabel: axisLabelStyle(theme),
      splitLine: splitLineStyle(theme),
    },
    series: series.map((item, index) => ({
      type: "scatter" as const,
      name: item.name,
      data: item.points.map((point) => ({
        value: [point.x, point.y],
        name: point.label,
      })),
      symbolSize: 9,
      itemStyle: {
        color:
          toneColor(item.tone, theme) ?? palette[index % palette.length],
      },
      emphasis: {
        scale: 1.2,
      },
    })),
  };

  const rootRef = useEChart({
    option,
    width,
    height,
    onItemHover,
    formatItemHover: (params) => {
      const mouse = params.event?.event;
      if (!mouse) return null;

      const raw = params.value;
      const coords = Array.isArray(raw) ? raw : [];
      const x = typeof coords[0] === "number" ? coords[0] : 0;
      const y = typeof coords[1] === "number" ? coords[1] : 0;
      const title =
        typeof params.name === "string" && params.name
          ? params.name
          : "Point";

      return {
        title,
        rows: [
          {
            label: "X",
            value: formatCoord(x, xSuffix),
            color: params.color,
          },
          {
            label: "Y",
            value: formatCoord(y, ySuffix),
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
