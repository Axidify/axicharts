"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import { hiddenTooltip, itemEmphasisOptions, seriesPalette, toneColor } from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import type { FunnelStage } from "./funnelTypes";
import { resolveFunnelLayout } from "./funnelLayout";

export type EChartsFunnelProps = {
  width: number;
  height: number;
  stages: FunnelStage[];
  theme: ChartTheme;
  sort?: "ascending" | "descending" | "none";
  onItemHover?: (event: EChartItemHoverEvent) => void;
  mergeOption?: boolean;
  graphics?: ChartGraphicElement[];
  animate?: boolean;
};

export function EChartsFunnel({
  width,
  height,
  stages,
  theme,
  sort = "descending",
  onItemHover,
  mergeOption = false,
  animate = false,
  graphics,
}: EChartsFunnelProps): ReactElement {
  const total = stages.reduce((sum, stage) => sum + stage.value, 0);
  const palette = seriesPalette(theme);
  const layout = resolveFunnelLayout(width, height);
  const data = stages.map((stage, index) => ({
    name: stage.name,
    value: stage.value,
    itemStyle: {
      color:
        stage.color ??
        toneColor(stage.tone, theme) ??
        palette[index % palette.length],
    },
  }));

  const option: EChartsOption = withPresentationAnimation(
    {
    tooltip: hiddenTooltip(),
    series: [
      {
        type: "funnel",
        left: layout.inset.left,
        top: layout.inset.top,
        bottom: layout.inset.bottom,
        width: layout.inset.width,
        min: 0,
        max: Math.max(...stages.map((stage) => stage.value), 1),
        minSize: layout.minSize,
        maxSize: "100%",
        sort,
        gap: layout.gap,
        label: {
          show: true,
          position: "inside",
          fontSize: layout.labelFontSize,
          color: "#f8fafc",
          formatter: layout.compact ? "{b}\n{d}%" : "{b}",
        },
        itemStyle: {
          borderColor:
            theme.name === "live" || theme.name === "industrial"
              ? "#0f172a"
              : "#ffffff",
          borderWidth: 1,
        },
        data,
        emphasis: itemEmphasisOptions(theme),
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
      if (!mouse || params.name == null) return null;
      const value = typeof params.value === "number" ? params.value : 0;
      const share = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
      return {
        title: params.name,
        rows: [
          { label: "Count", value: String(value), color: params.color },
          { label: "Share", value: `${share}%` },
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
