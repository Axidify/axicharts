"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import { resolveSunburstLayout } from "./nicheCompactLayout";
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
  graphics?: ChartGraphicElement[];
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
  graphics,
  onItemHover,
}: EChartsSunburstProps): ReactElement {
  const data = mapTreemapData(nodes, theme);
  const leafValues = flattenTreemapValues(nodes);
  const total = leafValues.reduce((sum, value) => sum + value, 0);
  const layout = resolveSunburstLayout(width, height, showLabels);
  const [innerRadius, outerRadius] = layout.radius;

  const option: EChartsOption = withPresentationAnimation(
    {
    tooltip: hiddenTooltip(),
    series: [
      {
        type: "sunburst",
        radius: layout.radius,
        sort: undefined,
        emphasis: {
          focus: "ancestor",
        },
        label: {
          show: layout.showLabels,
          rotate: "radial",
          fontSize: layout.labelFontSize,
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
            r0: innerRadius,
            r: "42%",
            label: { rotate: "tangential" },
          },
          {
            r0: "42%",
            r: outerRadius,
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
    graphics,
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
