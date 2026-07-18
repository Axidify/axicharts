"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import { axisLabelStyle, hiddenTooltip, seriesPalette, splitLineStyle, toneColor } from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import type { RadarIndicator, RadarSeries } from "./radarTypes";

export type EChartsRadarProps = {
  width: number;
  height: number;
  theme: ChartTheme;
  indicators: RadarIndicator[];
  series: RadarSeries[];
  showLabels?: boolean;
  showAxes?: boolean;
  areaFill?: boolean;
  animate?: boolean;
  mergeOption?: boolean;
  onItemHover?: (event: EChartItemHoverEvent) => void;
};

export function EChartsRadar({
  width,
  height,
  theme,
  indicators,
  series,
  showLabels = true,
  showAxes = true,
  areaFill = true,
  animate = false,
  mergeOption,
  onItemHover,
}: EChartsRadarProps): ReactElement {
  const palette = seriesPalette(theme);
  const maxByIndicator = indicators.map((indicator, index) => {
    const fromSeries = series.reduce(
      (max, item) => Math.max(max, item.values[index] ?? 0),
      0,
    );
    return indicator.max ?? Math.max(fromSeries, 1);
  });

  const option: EChartsOption = withPresentationAnimation(
    {
    tooltip: hiddenTooltip(),
    radar: {
      indicator: indicators.map((indicator, index) => ({
        name: indicator.name,
        max: maxByIndicator[index],
      })),
      center: ["50%", "52%"],
      radius: width < 320 ? "58%" : "66%",
      axisName: {
        show: showAxes,
        color: axisLabelStyle(theme).color,
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: splitLineStyle(theme).lineStyle.color,
          opacity: theme.grid.opacity,
        },
      },
      splitArea: { show: false },
      axisLine: {
        lineStyle: {
          color: splitLineStyle(theme).lineStyle.color,
          opacity: theme.grid.opacity,
        },
      },
    },
    series: [
      {
        type: "radar",
        data: series.map((item, index) => ({
          name: item.name,
          value: item.values,
          areaStyle: areaFill ? { opacity: 0.18 } : undefined,
          lineStyle: { width: 2 },
          itemStyle: {
            color:
              item.color ??
              toneColor(item.tone, theme) ??
              palette[index % palette.length],
          },
          label: {
            show: showLabels && width > 360,
            fontSize: 10,
            formatter: (params) =>
              params.value != null ? String(params.value) : "",
          },
        })),
      },
    ],
  },
    animate,
  );

  const rootRef = useEChart({
    option,
    width,
    height,
    onItemHover,
    mergeOption: mergeOption ?? !animate,
    formatItemHover: (params) => {
      const mouse = params.event?.event;
      if (!mouse || params.name == null) return null;
      const values = Array.isArray(params.value) ? params.value : [];
      return {
        title: params.name,
        rows: indicators.map((indicator, index) => ({
          label: indicator.name,
          value: String(values[index] ?? 0),
          color: params.color,
        })),
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
