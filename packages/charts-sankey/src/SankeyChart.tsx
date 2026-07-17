"use client";

import { useEffect, useMemo, useRef, type ReactElement } from "react";
import { useOptionalChartLayout } from "@axicharts/charts";
import { SankeyChart as EChartsSankeySeries } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import { CanvasRenderer } from "echarts/renderers";

export type SankeyNode = {
  name: string;
};

export type SankeyLink = {
  source: string;
  target: string;
  value: number;
};

export type SankeySurface = "light" | "dark";

export type SankeyChartProps = {
  nodes: SankeyNode[];
  links: SankeyLink[];
  width?: number;
  height?: number;
  surface?: SankeySurface;
};

let echartsReady = false;

function ensureEcharts(): void {
  if (echartsReady) return;
  echarts.use([EChartsSankeySeries, TooltipComponent, CanvasRenderer]);
  echartsReady = true;
}

export const SAMPLE_SANKEY_FLOW: SankeyChartProps = {
  nodes: [
    { name: "Solar" },
    { name: "Grid" },
    { name: "Boiler" },
    { name: "Line A" },
    { name: "Line B" },
    { name: "Losses" },
  ],
  links: [
    { source: "Solar", target: "Grid", value: 12 },
    { source: "Grid", target: "Boiler", value: 18 },
    { source: "Grid", target: "Line A", value: 22 },
    { source: "Grid", target: "Line B", value: 16 },
    { source: "Boiler", target: "Line A", value: 10 },
    { source: "Boiler", target: "Losses", value: 8 },
  ],
};

const NODE_COLORS_LIGHT = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
];

const NODE_COLORS_DARK = [
  "#60a5fa",
  "#4ade80",
  "#fbbf24",
  "#a78bfa",
  "#22d3ee",
  "#f87171",
];

function resolveSurface(
  explicit: SankeySurface | undefined,
  themeName: string | undefined,
): SankeySurface {
  if (explicit) return explicit;
  if (themeName === "live" || themeName === "industrial") return "dark";
  return "light";
}

function buildOption(
  nodes: SankeyNode[],
  links: SankeyLink[],
  surface: SankeySurface,
): EChartsOption {
  const palette = surface === "dark" ? NODE_COLORS_DARK : NODE_COLORS_LIGHT;
  const labelColor = surface === "dark" ? "#cbd5e1" : "#334155";
  const tooltipBg = surface === "dark" ? "rgba(15, 23, 42, 0.94)" : "rgba(255, 255, 255, 0.96)";
  const tooltipBorder = surface === "dark" ? "#334155" : "#e2e8f0";
  const tooltipText = surface === "dark" ? "#e2e8f0" : "#0f172a";

  return {
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: tooltipText, fontSize: 11 },
    },
    series: [
      {
        type: "sankey",
        emphasis: { focus: "adjacency" },
        data: nodes.map((node, index) => ({
          ...node,
          itemStyle: { color: palette[index % palette.length] },
        })),
        links,
        lineStyle: {
          color: "gradient",
          curveness: 0.5,
          opacity: surface === "dark" ? 0.45 : 0.35,
        },
        label: { color: labelColor, fontSize: 11 },
        nodeGap: 10,
        nodeWidth: 14,
      },
    ],
  };
}

export function SankeyChart({
  nodes,
  links,
  width: widthProp,
  height: heightProp,
  surface: surfaceProp,
}: SankeyChartProps): ReactElement | null {
  const layout = useOptionalChartLayout();
  const width = Math.floor(widthProp ?? layout?.size.width ?? 420);
  const height = Math.floor(heightProp ?? layout?.size.height ?? 240);
  const surface = resolveSurface(surfaceProp, layout?.theme.name);
  const rootRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const option = useMemo(
    () => buildOption(nodes, links, surface),
    [nodes, links, surface],
  );

  useEffect(() => {
    if (!rootRef.current || width < 1 || height < 1) return;
    ensureEcharts();
    const chart = echarts.init(rootRef.current, undefined, { renderer: "canvas" });
    chartRef.current = chart;
    return () => {
      chart.dispose();
      chartRef.current = null;
    };
  }, [width, height]);

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true });
  }, [option]);

  useEffect(() => {
    chartRef.current?.resize({ width, height });
  }, [width, height]);

  if (layout && !layout.ready) return null;
  if (width < 1 || height < 1) return null;

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label="Sankey flow diagram"
      className="axicharts-sankey"
      style={{ width, height, background: "transparent" }}
    />
  );
}
