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
import { pieOuterRadius } from "./pieLayout";
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
      series: [
        {
          type: "pie",
          radius: pieOuterRadius(theme, innerRadius),
          center: ["50%", "50%"],
          padAngle: gap.padAngle,
          avoidLabelOverlap: true,
          minShowLabelAngle: 8,
          data,
          itemStyle: gap.itemStyle,
          emphasis: {
            scale: !presentation,
            scaleSize: 6,
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(15, 23, 42, 0.12)",
            },
          },
          label: {
            show: showLabels,
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
            show: showLabels,
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
