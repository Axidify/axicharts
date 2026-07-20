"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import { resolveChartChrome } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import { echartsColor } from "./echartsColor";
import { gridOptions, hiddenTooltip, isCompactTile, seriesPalette } from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import { resolvePieSliceColor } from "./pieSliceColor";
import { pieGapOptions } from "./pieGapOptions";
import { pieCenter, pieEmphasisOptions, pieLabelMode, pieOuterRadius } from "./pieLayout";
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
  const presentation = animate || theme.name === "presentation";
  const chrome = resolveChartChrome(theme);
  const labelColor = echartsColor(chrome.axis);
  const palette = seriesPalette(theme);
  const gap = pieGapOptions(innerRadius);
  const compact = isCompactTile(width, height);
  const labelMode = pieLabelMode(width, height, showLabels);
  const useExternalLabels = labelMode === "external";

  const data = slices.map((slice, index) => ({
    name: slice.name,
    value: slice.value,
    itemStyle: {
      color: resolvePieSliceColor(slice, index, palette, theme),
    },
  }));

  const option: EChartsOption = withPresentationAnimation(
    {
      grid: gridOptions(theme, compact),
      tooltip: hiddenTooltip(),
      legend:
        labelMode === "legend"
          ? {
              show: true,
              type: "plain",
              orient: "horizontal",
              bottom: 2,
              left: "center",
              itemWidth: 7,
              itemHeight: 7,
              itemGap: 10,
              icon: "circle",
              textStyle: {
                color: labelColor,
                fontSize: 11,
                fontWeight: 500,
              },
              formatter: (name: string) => {
                const slice = slices.find((item) => item.name === name);
                if (!slice || total <= 0) return name;
                return `${name}  ${Math.round((slice.value / total) * 100)}%`;
              },
            }
          : { show: false },
      series: [
        {
          type: "pie",
          radius: pieOuterRadius(theme, innerRadius, labelMode),
          center: pieCenter(labelMode),
          padAngle: gap.padAngle,
          avoidLabelOverlap: true,
          minShowLabelAngle: 8,
          data,
          itemStyle: gap.itemStyle,
          emphasis: pieEmphasisOptions(presentation),
          label: {
            show: useExternalLabels,
            formatter: "{name|{b}}\n{pct|{d}%}",
            rich: {
              name: {
                color: labelColor,
                fontSize: presentation ? 12 : 11,
                fontWeight: presentation ? 600 : 500,
                lineHeight: presentation ? 18 : 16,
              },
              pct: {
                color: labelColor,
                fontSize: presentation ? 11 : 10,
                fontWeight: 600,
                lineHeight: presentation ? 16 : 14,
                opacity: 0.88,
              },
            },
          },
          labelLine: {
            show: useExternalLabels,
            length: presentation ? 14 : 12,
            length2: presentation ? 12 : 10,
            smooth: 0.25,
            lineStyle: {
              color: labelColor,
              width: 1,
              opacity: 0.55,
            },
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
