"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import {
  axisLabelStyle,
  hiddenTooltip,
  seriesPalette,
  toneColor,
} from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import type { GraphChartData, GraphNode } from "./graphTypes";

export type GraphLayout = "force" | "none" | "circular";

export type EChartsGraphProps = {
  width: number;
  height: number;
  theme: ChartTheme;
  data: GraphChartData;
  layout?: GraphLayout;
  roam?: boolean;
  showLegend?: boolean;
  repulsion?: number;
  edgeLength?: number | [number, number];
  onItemHover?: (event: EChartItemHoverEvent) => void;
  mergeOption?: boolean;
  graphics?: ChartGraphicElement[];
  animate?: boolean;
};

function resolveCategoryIndex(
  node: GraphNode,
  categories: GraphChartData["categories"],
): number | undefined {
  if (node.category == null) return undefined;
  if (typeof node.category === "number") return node.category;
  const index = categories?.findIndex((item) => item.name === node.category) ?? -1;
  return index >= 0 ? index : undefined;
}

function resolveSymbolSize(node: GraphNode, fallback: number): number {
  if (node.symbolSize != null && Number.isFinite(node.symbolSize)) {
    return node.symbolSize;
  }
  if (node.value != null && Number.isFinite(node.value)) {
    return Math.max(12, Math.min(48, 12 + node.value * 0.4));
  }
  return fallback;
}

export function EChartsGraph({
  width,
  height,
  theme,
  data,
  layout = "force",
  roam = true,
  showLegend = false,
  repulsion = 220,
  edgeLength = [40, 120],
  onItemHover,
  mergeOption = false,
  animate = false,
  graphics,
}: EChartsGraphProps): ReactElement {
  const palette = seriesPalette(theme);
  const labelStyle = axisLabelStyle(theme);
  const categories = data.categories ?? [];
  const defaultSize = Math.max(14, Math.min(28, Math.round(Math.min(width, height) * 0.06)));

  const option: EChartsOption = withPresentationAnimation(
    {
      tooltip: hiddenTooltip(),
      legend: showLegend
        ? {
            show: true,
            bottom: 0,
            textStyle: labelStyle,
          }
        : { show: false },
      series: [
        {
          type: "graph",
          layout,
          roam,
          draggable: layout === "force",
          categories,
          label: {
            show: true,
            position: "right",
            color: labelStyle.color,
            fontSize: 11,
          },
          force:
            layout === "force"
              ? {
                  repulsion,
                  edgeLength,
                  layoutAnimation: !mergeOption,
                }
              : undefined,
          data: data.nodes.map((node, index) => {
            const categoryIndex = resolveCategoryIndex(node, categories);
            const color =
              node.color ??
              (categoryIndex != null
                ? palette[categoryIndex % palette.length]
                : toneColor(node.tone, theme) ?? palette[index % palette.length]);

            return {
              id: node.id,
              name: node.name ?? node.id,
              value: node.value,
              category: categoryIndex,
              symbolSize: resolveSymbolSize(node, defaultSize),
              itemStyle: { color },
            };
          }),
          links: data.edges.map((edge) => ({
            source: edge.source,
            target: edge.target,
            value: edge.value,
            lineStyle: edge.lineStyle,
          })),
          emphasis: {
            focus: "adjacency",
            lineStyle: { width: 3 },
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
    mergeOption,
    formatItemHover: (rawParams) => {
      const params = rawParams as typeof rawParams & {
        dataType?: "node" | "edge";
        data?: { source?: string; target?: string; value?: number };
        name?: string;
        value?: number;
      };
      const mouse = params.event?.event;
      if (!mouse) return null;

      if (params.dataType === "edge") {
        const source = params.data?.source ?? "";
        const target = params.data?.target ?? "";
        return {
          title: `${source} → ${target}`,
          rows: params.data?.value != null
            ? [{ label: "Weight", value: String(params.data.value), color: params.color }]
            : [],
          left: mouse.offsetX,
          top: mouse.offsetY,
        };
      }

      const name = params.name ?? String(params.data);
      return {
        title: name,
        rows:
          params.value != null
            ? [{ label: "Value", value: String(params.value), color: params.color }]
            : [],
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
