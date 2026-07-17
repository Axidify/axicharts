import { useEffect, useMemo, useRef, type ReactElement } from "react";
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

export type SankeyChartProps = {
  nodes: SankeyNode[];
  links: SankeyLink[];
  width?: number;
  height?: number;
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

function buildOption(nodes: SankeyNode[], links: SankeyLink[]): EChartsOption {
  return {
    tooltip: { trigger: "item", triggerOn: "mousemove" },
    series: [
      {
        type: "sankey",
        emphasis: { focus: "adjacency" },
        data: nodes,
        links,
        lineStyle: { color: "gradient", curveness: 0.5 },
        label: { color: "#334155", fontSize: 11 },
      },
    ],
  };
}

export function SankeyChart({
  nodes,
  links,
  width = 420,
  height = 240,
}: SankeyChartProps): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const option = useMemo(() => buildOption(nodes, links), [nodes, links]);

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
