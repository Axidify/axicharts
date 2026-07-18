"use client";

import type { ReactElement } from "react";
import {
  EChartsSunburst,
  type HierarchyNode,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";

export type SunburstChartProps = {
  nodes: HierarchyNode[];
  showLabels?: boolean;
};

function SunburstPlot({
  nodes,
  showLabels,
}: SunburstChartProps): ReactElement {
  const { size, theme } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsSunburst
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      nodes={nodes}
      theme={theme}
      showLabels={showLabels}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function SunburstChart({
  nodes,
  showLabels = true,
}: SunburstChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  return (
    <EChartsInteractionShell
      plot={<SunburstPlot nodes={nodes} showLabels={showLabels} />}
    />
  );
}

export type { HierarchyNode } from "@axicharts/charts-echarts";
