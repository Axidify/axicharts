"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import { axisLabelStyle, hiddenTooltip, seriesPalette } from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import type { CalendarHeatmapData } from "./types";
import { resolveCalendarHeatmapLayout } from "./calendarLayout";

export type EChartsCalendarHeatmapProps = {
  width: number;
  height: number;
  data: CalendarHeatmapData;
  year?: number;
  range?: [string, string];
  theme: ChartTheme;
  min?: number;
  max?: number;
  showLabels?: boolean;
  cellSize?: number | [number, number];
  cellFormatter?: (value: number) => string;
  mergeOption?: boolean;
  graphics?: ChartGraphicElement[];
  animate?: boolean;
  chartId?: string;
  syncSourceId?: string | null;
  onItemHover?: (event: EChartItemHoverEvent) => void;
};

function heatmapColors(theme: ChartTheme): string[] {
  const palette = seriesPalette(theme);
  return [
    "#ebedf0",
    palette[2] ?? palette[0] ?? "#3b82f6",
    palette[4] ?? palette[1] ?? "#1e3a8a",
  ];
}

export function inferCalendarYear(data: CalendarHeatmapData): number {
  if (data.year != null) {
    return data.year;
  }

  if (data.points.length > 0) {
    const year = Number.parseInt(data.points[0]!.date.slice(0, 4), 10);
    if (!Number.isNaN(year)) {
      return year;
    }
  }

  return new Date().getFullYear();
}

export function inferCalendarRange(
  data: CalendarHeatmapData,
  year: number,
): string | [string, string] {
  if (data.range) {
    return data.range;
  }

  return String(year);
}

export function EChartsCalendarHeatmap({
  width,
  height,
  data,
  year: yearProp,
  range: rangeProp,
  theme,
  min,
  max,
  showLabels,
  cellSize,
  cellFormatter,
  mergeOption = false,
  animate = false,
  chartId,
  syncSourceId,
  onItemHover,
  graphics,
}: EChartsCalendarHeatmapProps): ReactElement {
  const year = yearProp ?? inferCalendarYear(data);
  const range = rangeProp ?? inferCalendarRange(data, year);

  const seriesData = useMemo(
    () => data.points.map((point) => [point.date, point.value] as [string, number]),
    [data.points],
  );

  const values = data.points.map((point) => point.value);
  const computedMin = min ?? (values.length > 0 ? Math.min(...values) : 0);
  const computedMax = max ?? (values.length > 0 ? Math.max(...values) : 1);
  const layout = resolveCalendarHeatmapLayout(width, height, { showLabels });
  const resolvedCellSize = cellSize ?? layout.cellSize;

  const option: EChartsOption = withPresentationAnimation(
    {
      tooltip: hiddenTooltip(),
      calendar: {
        top: layout.inset.top,
        left: layout.inset.left,
        right: layout.inset.right,
        bottom: layout.inset.bottom,
        range,
        cellSize: Array.isArray(resolvedCellSize)
          ? resolvedCellSize
          : (["auto", resolvedCellSize] as [number | "auto", number]),
        itemStyle: {
          borderWidth: 2,
          borderColor: "#fff",
        },
        yearLabel: {
          show: !layout.compact,
          ...axisLabelStyle(theme),
        },
        monthLabel: {
          ...axisLabelStyle(theme),
          fontSize: layout.compact ? 9 : 11,
        },
        dayLabel: {
          firstDay: 1,
          nameMap: layout.compact
            ? ["S", "M", "T", "W", "T", "F", "S"]
            : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          ...axisLabelStyle(theme),
          fontSize: layout.compact ? 8 : 11,
        },
      },
      visualMap: {
        min: computedMin,
        max: computedMax,
        calculable: false,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        inRange: {
          color: heatmapColors(theme),
        },
        textStyle: {
          fontSize: layout.compact ? 9 : 10,
          color: axisLabelStyle(theme).color,
        },
      },
      series: [
        {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: seriesData,
          label: {
            show: layout.showCellLabels,
            fontSize: 9,
            color: "#0f172a",
            textBorderColor: "rgba(255,255,255,0.85)",
            textBorderWidth: 2,
            formatter: (params) => {
              const raw = params.value;
              const value = Array.isArray(raw)
                ? Number(raw[1] ?? 0)
                : Number(raw ?? 0);
              return cellFormatter ? cellFormatter(value) : String(value);
            },
          },
          emphasis: {
            itemStyle: { shadowBlur: 6, shadowColor: "rgba(0,0,0,0.2)" },
          },
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
    chartId,
    syncSourceId,
    onItemHover,
    mergeOption: mergeOption ?? !animate,
    formatItemHover: (params) => {
      const mouse = params.event?.event;
      if (!mouse || !Array.isArray(params.data)) return null;
      const [date, value] = params.data as [string, number];
      const formatted = cellFormatter ? cellFormatter(value) : String(value);
      return {
        title: date,
        rows: [{ label: "Value", value: formatted, color: params.color }],
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
