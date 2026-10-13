"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import {
  axisLabelStyle,
  hiddenTooltip,
  isCompactTile,
  seriesPalette,
  toneColor,
} from "./themeBridge";
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
  graphics?: ChartGraphicElement[];
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

/** Numbers are timestamps; strings must parse as dates for a time axis. */
function isTemporal(time: string | number): boolean {
  return typeof time === "number" || !Number.isNaN(Date.parse(time));
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
  graphics,
}: EChartsThemeRiverProps): ReactElement {
  const palette = seriesPalette(theme);
  const labelStyle = axisLabelStyle(theme);
  const seriesNames = [...new Set(points.map((point) => point.series))];
  // Labels like "W1" / "Q3" on a time axis parse as invalid dates and collapse
  // every stream. ECharts themeRiver can't lay out on a category axis either
  // (empty stream paths), so labels map to indices on a value axis and the
  // tick formatter prints the label back.
  const temporal = points.every((point) => isTemporal(point.time));
  const categories = temporal
    ? undefined
    : [...new Set(points.map((point) => String(point.time)))];
  const axisPosition = (time: string | number) =>
    categories ? categories.indexOf(String(time)) : time;
  // Fixed 36px gutters left ~48px of stream in 120px dashboard tiles.
  const compact = isCompactTile(width, height);
  const gutter = compact
    ? { top: 8, bottom: showAxes ? 22 : 8, left: 12, right: 12 }
    : { top: 36, bottom: 36, left: 48, right: 48 };

  const option: EChartsOption = withPresentationAnimation(
    {
      tooltip: hiddenTooltip(),
      color: seriesNames.map((name) =>
        resolveSeriesColor(name, points, palette, theme),
      ),
      singleAxis: {
        ...gutter,
        ...(categories
          ? {
              type: "value" as const,
              min: 0,
              max: Math.max(categories.length - 1, 1),
              interval: 1,
            }
          : { type: "time" as const }),
        show: showAxes,
        axisLabel: {
          ...labelStyle,
          hideOverlap: true,
          // Default time ticks read "2026, 3, 5, 7…" (bare day numbers).
          ...(categories
            ? { formatter: (value: number) => categories[value] ?? "" }
            : {
                formatter: {
                  year: "{yyyy}",
                  month: "{MMM}",
                  day: "{MMM} {d}",
                  hour: "{HH}:{mm}",
                  minute: "{HH}:{mm}",
                },
              }),
        },
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
            axisPosition(point.time),
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
    graphics,
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
          {
            label: "Time",
            value: categories ? (categories[Number(time)] ?? String(time)) : String(time),
            color: params.color,
          },
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
