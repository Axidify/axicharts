"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import { axisLabelStyle, hiddenTooltip, seriesPalette, toneColor } from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import type { ThemeRiverPoint } from "./themeRiverTypes";

export type EChartsThemeRiverProps = {
  width: number;
  height: number;
  theme: ChartTheme;
  points: ThemeRiverPoint[];
  showAxes?: boolean;
  onItemHover?: (event: EChartItemHoverEvent) => void;
  mergeOption?: boolean;
  animate?: boolean;
};

function resolveSeriesColor(
  seriesName: string,
  points: ThemeRiverPoint[],
  palette: string[],
  theme: ChartTheme,
): string {
  const match = points.find((point) => point.series === seriesName);
  if (match?.color) {
    return match.color;
  }
  const tone = match?.tone;
  const fromTone = tone ? toneColor(tone, theme) : undefined;
  if (fromTone) {
    return fromTone;
  }
  const names = [...new Set(points.map((point) => point.series))];
  const index = names.indexOf(seriesName);
  return palette[index >= 0 ? index % palette.length : 0] ?? palette[0] ?? "#3b82f6";
}

export function EChartsThemeRiver({
  width,
  height,
  theme,
  points,
  showAxes = true,
  onItemHover,
  mergeOption = false,
  animate = false,
}: EChartsThemeRiverProps): ReactElement {
  const palette = seriesPalette(theme);
  const labelStyle = axisLabelStyle(theme);
  const seriesNames = [...new Set(points.map((point) => point.series))];

  const option: EChartsOption = withPresentationAnimation(
    {
      tooltip: hiddenTooltip(),
      color: seriesNames.map((name) =>
        resolveSeriesColor(name, points, palette, theme),
      ),
      singleAxis: {
        top: 36,
        bottom: 36,
        left: 48,
        right: 48,
        type: "time",
        show: showAxes,
        axisLabel: labelStyle,
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            opacity: 0.2,
          },
        },
      },
      series: [
        {
          type: "themeRiver",
          emphasis: {
            itemStyle: {
              shadowBlur: 12,
              shadowColor: "rgba(0, 0, 0, 0.25)",
            },
          },
          data: points.map((point) => [
            point.time,
            point.value,
            point.series,
          ]),
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
    mergeOption,
    formatItemHover: (params) => {
      const mouse = params.event?.event;
      if (!mouse || !Array.isArray(params.data)) return null;
      const [time, value, series] = params.data as [string | number, number, string];
      return {
        title: String(series),
        rows: [
          { label: "Time", value: String(time), color: params.color },
          { label: "Value", value: String(value), color: params.color },
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
