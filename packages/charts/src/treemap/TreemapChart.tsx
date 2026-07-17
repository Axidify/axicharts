"use client";

import type { ReactElement } from "react";
import {
  EChartsTreemap,
  type TreemapNode,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";

export type TreemapChartProps = {
  nodes: TreemapNode[];
  showLabels?: boolean;
};

function TreemapPlot({
  nodes,
  showLabels,
}: TreemapChartProps): ReactElement {
  const { size, theme } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsTreemap
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      nodes={nodes}
      theme={theme}
      showLabels={showLabels}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function TreemapChart({
  nodes,
  showLabels = true,
}: TreemapChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  return (
    <EChartsInteractionShell
      plot={<TreemapPlot nodes={nodes} showLabels={showLabels} />}
    />
  );
}

export type { TreemapNode } from "@axicharts/charts-echarts";
