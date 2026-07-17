"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import { hiddenTooltip, toneColor } from "./themeBridge";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import { SERIES_PALETTE } from "./types";
import type { FunnelStage } from "./funnelTypes";

export type EChartsFunnelProps = {
  width: number;
  height: number;
  stages: FunnelStage[];
  theme: ChartTheme;
  sort?: "ascending" | "descending" | "none";
  onItemHover?: (event: EChartItemHoverEvent) => void;
};

export function EChartsFunnel({
  width,
  height,
  stages,
  theme,
  sort = "descending",
  onItemHover,
}: EChartsFunnelProps): ReactElement {
  const total = stages.reduce((sum, stage) => sum + stage.value, 0);
  const data = stages.map((stage, index) => ({
    name: stage.name,
    value: stage.value,
    itemStyle: {
      color:
        stage.color ??
        toneColor(stage.tone) ??
        SERIES_PALETTE[index % SERIES_PALETTE.length],
    },
  }));

  const option: EChartsOption = {
    tooltip: hiddenTooltip(),
    series: [
      {
        type: "funnel",
        left: "8%",
        top: 16,
        bottom: 16,
        width: "84%",
        min: 0,
        max: Math.max(...stages.map((stage) => stage.value), 1),
        minSize: "12%",
        maxSize: "100%",
        sort,
        gap: 4,
        label: {
          show: true,
          position: "inside",
          fontSize: 11,
          color: "#f8fafc",
          formatter: "{b}",
        },
        itemStyle: {
          borderColor:
            theme.name === "live" || theme.name === "industrial"
              ? "#0f172a"
              : "#ffffff",
          borderWidth: 1,
        },
        data,
      },
    ],
  };

  const rootRef = useEChart({
    option,
    width,
    height,
    onItemHover,
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
