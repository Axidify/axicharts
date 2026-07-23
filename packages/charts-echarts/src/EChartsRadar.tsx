"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import { axisLabelStyle, hiddenTooltip, isCompactTile, itemEmphasisOptions, seriesPalette, splitLineStyle, toneColor } from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import type { RadarIndicator, RadarSeries } from "./radarTypes";
import { resolveRadarLayout, radarIndicatorOrder } from "./radarLayout";

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
  graphics?: ChartGraphicElement[];
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
  graphics,
  onItemHover,
}: EChartsRadarProps): ReactElement {
  const palette = seriesPalette(theme);
  const layout = resolveRadarLayout(width, height, series.length);
  const { compact, showLegend } = layout;
  const labelColor = axisLabelStyle(theme).color;
  const orderedIndicators = radarIndicatorOrder(indicators);
  const orderedSeries = series.map((item) => ({
    ...item,
    values: radarIndicatorOrder(item.values),
  }));
  const maxByIndicator = orderedIndicators.map((indicator, index) => {
    const fromSeries = orderedSeries.reduce(
      (max, item) => Math.max(max, item.values[index] ?? 0),
      0,
    );
    return indicator.max ?? Math.max(fromSeries, 1);
  });

  const option: EChartsOption = withPresentationAnimation(
    {
    tooltip: hiddenTooltip(),
    legend: showLegend
      ? {
          show: true,
          type: "plain",
          orient: "horizontal",
          bottom: 2,
          left: "center",
          itemWidth: 10,
          itemHeight: 8,
          itemGap: 12,
          icon: "roundRect",
          textStyle: {
            color: labelColor,
            fontSize: compact ? 10 : 11,
            fontWeight: 500,
          },
        }
      : { show: false },
    radar: {
      indicator: orderedIndicators.map((indicator, index) => ({
        name: indicator.name,
        max: maxByIndicator[index],
      })),
      startAngle: layout.startAngle,
      center: layout.center,
      radius: layout.radius,
      axisName: {
        show: showAxes,
        color: labelColor,
        fontSize: compact ? 10 : 11,
      },
      axisLabel: {
        show: showAxes && !layout.hideRadialLabels,
        color: labelColor,
        fontSize: compact ? 9 : 10,
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
        emphasis: itemEmphasisOptions(theme, { focus: "series" }),
        data: orderedSeries.map((item, index) => ({
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
            // Compact tiles rely on legend + hover — value labels crowd the polar plot.
            show: showLabels && !compact && width > 360,
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
    graphics,
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
        rows: orderedIndicators.map((indicator, index) => ({
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
