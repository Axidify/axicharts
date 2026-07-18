"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import { axisLabelStyle, gridOptions, hiddenTooltip, seriesPalette, splitLineStyle } from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import type { HeatmapMatrix } from "./types";

export type HeatmapBrushRange = {
  start: number;
  end: number;
};

export type EChartsHeatmapProps = {
  width: number;
  height: number;
  matrix: HeatmapMatrix;
  theme: ChartTheme;
  min?: number;
  max?: number;
  showLabels?: boolean;
  showAxes?: boolean;
  cellFormatter?: (value: number) => string;
  mergeOption?: boolean;
  graphics?: ChartGraphicElement[];
  animate?: boolean;
  brushRange?: HeatmapBrushRange | null;
  syncIndex?: number | null;
  chartId?: string;
  syncSourceId?: string | null;
  onSyncIndex?: (index: number | null) => void;
  onItemHover?: (event: EChartItemHoverEvent) => void;
};

function heatmapColors(theme: ChartTheme): string[] {
  const palette = seriesPalette(theme);
  return ["#eff6ff", palette[2] ?? palette[0] ?? "#3b82f6", palette[4] ?? palette[1] ?? "#1e3a8a"];
}

export function sliceHeatmapByBrushRange(
  matrix: HeatmapMatrix,
  range: HeatmapBrushRange | null,
): HeatmapMatrix {
  if (!range || matrix.xCategories.length === 0) {
    return matrix;
  }

  const count = matrix.xCategories.length;
  const startIndex = Math.max(
    0,
    Math.min(count - 1, Math.floor((range.start / 100) * count)),
  );
  const endIndex = Math.max(
    startIndex + 1,
    Math.min(count, Math.ceil((range.end / 100) * count)),
  );

  return {
    xCategories: matrix.xCategories.slice(startIndex, endIndex),
    yCategories: matrix.yCategories,
    values: matrix.values.map((row) => row.slice(startIndex, endIndex)),
  };
}

function mapSyncColumnIndex(
  syncIndex: number | null | undefined,
  range: HeatmapBrushRange | null | undefined,
  totalCount: number,
): number | null {
  if (syncIndex == null || syncIndex < 0) {
    return null;
  }

  if (!range || totalCount === 0) {
    return syncIndex;
  }

  const startIndex = Math.max(
    0,
    Math.min(totalCount - 1, Math.floor((range.start / 100) * totalCount)),
  );
  const endIndex = Math.max(
    startIndex + 1,
    Math.min(totalCount, Math.ceil((range.end / 100) * totalCount)),
  );

  if (syncIndex < startIndex || syncIndex >= endIndex) {
    return null;
  }

  return syncIndex - startIndex;
}

export function EChartsHeatmap({
  width,
  height,
  matrix,
  theme,
  min,
  max,
  showLabels,
  showAxes = true,
  cellFormatter,
  mergeOption = false,
  animate = false,
  brushRange,
  syncIndex,
  chartId,
  syncSourceId,
  onSyncIndex,
  onItemHover,
  graphics,
}: EChartsHeatmapProps): ReactElement {
  const slicedMatrix = useMemo(
    () => sliceHeatmapByBrushRange(matrix, brushRange ?? null),
    [matrix, brushRange],
  );

  const flat = slicedMatrix.values.flat();
  const computedMin = min ?? (flat.length > 0 ? Math.min(...flat) : 0);
  const computedMax = max ?? (flat.length > 0 ? Math.max(...flat) : 1);
  const labelVisible = showLabels ?? width > 360;

  const data: [number, number, number][] = [];
  slicedMatrix.values.forEach((row, yIndex) => {
    row.forEach((value, xIndex) => {
      data.push([xIndex, yIndex, value]);
    });
  });

  const highlightColumn = mapSyncColumnIndex(
    syncIndex,
    brushRange,
    matrix.xCategories.length,
  );

  const option: EChartsOption = withPresentationAnimation(
    {
    grid: {
      ...gridOptions(theme),
      bottom: 40,
    },
    tooltip: hiddenTooltip(),
    xAxis: {
      type: "category",
      data: slicedMatrix.xCategories,
      show: showAxes,
      axisLabel: axisLabelStyle(theme),
      splitLine: splitLineStyle(theme),
    },
    yAxis: {
      type: "category",
      data: slicedMatrix.yCategories,
      show: showAxes,
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
        color: heatmapColors(theme),
      },
      textStyle: { fontSize: 10, color: axisLabelStyle(theme).color },
    },
    series: [
      {
        type: "heatmap",
        data,
        label: {
          show: labelVisible,
          fontSize: 10,
          color: "#0f172a",
          textBorderColor: "rgba(255,255,255,0.85)",
          textBorderWidth: 2,
          formatter: (params) => {
            const raw = params.value;
            const value = Array.isArray(raw)
              ? Number(raw[2] ?? 0)
              : Number(raw ?? 0);
            return cellFormatter ? cellFormatter(value) : String(value);
          },
        },
        emphasis: {
          itemStyle: { shadowBlur: 6, shadowColor: "rgba(0,0,0,0.2)" },
        },
        markArea:
          highlightColumn != null
            ? {
                silent: true,
                itemStyle: {
                  color: "rgba(37, 99, 235, 0.08)",
                  borderColor: "rgba(37, 99, 235, 0.35)",
                  borderWidth: 1,
                },
                data: [
                  [
                    { xAxis: highlightColumn },
                    { xAxis: highlightColumn },
                  ],
                ],
              }
            : undefined,
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
    categories: slicedMatrix.xCategories,
    chartId,
    onSyncIndex,
    syncIndex: highlightColumn,
    syncSourceId,
    onItemHover,
    mergeOption: mergeOption ?? !animate,
    formatItemHover: (params) => {
      const mouse = params.event?.event;
      if (!mouse || !Array.isArray(params.data)) return null;
      const [x, y, value] = params.data as [number, number, number];
      const formatted = cellFormatter ? cellFormatter(value) : String(value);
      return {
        title: `${slicedMatrix.xCategories[x]} · ${slicedMatrix.yCategories[y]}`,
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
