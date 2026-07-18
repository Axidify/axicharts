"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import { hiddenTooltip } from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import { flattenTreemapValues, mapTreemapData } from "./treemapData";
import type { HierarchyNode } from "./hierarchyTypes";

export type EChartsSunburstProps = {
  width: number;
  height: number;
  nodes: HierarchyNode[];
  theme: ChartTheme;
  showLabels?: boolean;
  animate?: boolean;
  mergeOption?: boolean;
  onItemHover?: (event: EChartItemHoverEvent) => void;
};

function formatShare(value: number, total: number): string {
  if (total <= 0) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function EChartsSunburst({
  width,
  height,
  nodes,
  theme,
  showLabels = true,
  animate = false,
  mergeOption,
  onItemHover,
}: EChartsSunburstProps): ReactElement {
  const data = mapTreemapData(nodes, theme);
  const leafValues = flattenTreemapValues(nodes);
  const total = leafValues.reduce((sum, value) => sum + value, 0);

  const option: EChartsOption = withPresentationAnimation(
    {
    tooltip: hiddenTooltip(),
    series: [
      {
        type: "sunburst",
        radius: ["12%", "92%"],
        sort: undefined,
        emphasis: {
          focus: "ancestor",
        },
        label: {
          show: showLabels,
          rotate: "radial",
          fontSize: 11,
          color: "#0f172a",
        },
        itemStyle: {
          borderColor:
            theme.name === "live" || theme.name === "industrial"
              ? "#0f172a"
              : "#ffffff",
          borderWidth: 1,
        },
        levels: [
          {},
          {
            r0: "12%",
            r: "42%",
            label: { rotate: "tangential" },
          },
          {
            r0: "42%",
            r: "92%",
            label: { rotate: "radial" },
          },
        ],
        data,
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
      const value = typeof params.value === "number" ? params.value : 0;
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
            value: formatShare(value, total),
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
