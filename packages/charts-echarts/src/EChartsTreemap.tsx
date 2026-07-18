"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import { hiddenTooltip } from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import { flattenTreemapValues, mapTreemapData } from "./treemapData";
import type { TreemapNode } from "./treemapTypes";
import { buildTreemapDrillOptions, type TreemapDrillChange } from "./treemapDrill";

export type EChartsTreemapProps = {
  width: number;
  height: number;
  nodes: TreemapNode[];
  theme: ChartTheme;
  showLabels?: boolean;
  drilldown?: boolean;
  onDrillChange?: (state: TreemapDrillChange) => void;
  onItemHover?: (event: EChartItemHoverEvent) => void;
  mergeOption?: boolean;
  animate?: boolean;
};

function formatShare(value: number, total: number): string {
  if (total <= 0) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function EChartsTreemap({
  width,
  height,
  nodes,
  theme,
  showLabels = true,
  drilldown = false,
  onDrillChange,
  onItemHover,
  mergeOption = false,
  animate = false,
}: EChartsTreemapProps): ReactElement {
  const data = mapTreemapData(nodes, theme);
  const leafValues = flattenTreemapValues(nodes);
  const total = leafValues.reduce((sum, value) => sum + value, 0);
  const drillOptions = buildTreemapDrillOptions({ drilldown });

  const option: EChartsOption = withPresentationAnimation(
    {
    tooltip: hiddenTooltip(),
    series: [
      {
        type: "treemap",
        width: "100%",
        height: "100%",
        roam: false,
        ...drillOptions,
        label: {
          show: showLabels,
          fontSize: 11,
          color: "#0f172a",
        },
        upperLabel: {
          show: showLabels,
          height: 22,
          color: "#0f172a",
          fontSize: 11,
        },
        itemStyle: {
          borderColor: theme.name === "live" || theme.name === "industrial"
            ? "#0f172a"
            : "#ffffff",
          borderWidth: 1,
          gapWidth: 1,
        },
        levels: [
          {
            itemStyle: {
              borderWidth: 0,
              gapWidth: 2,
            },
          },
          {
            itemStyle: {
              gapWidth: 1,
            },
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
    mergeOption,
    onTreemapDrill: onDrillChange
      ? (path) => onDrillChange({ path })
      : undefined,
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
