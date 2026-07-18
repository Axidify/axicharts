"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  EChartsSunburst,
  type HierarchyNode,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { buildHierarchyA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type SunburstChartProps = {
  nodes: HierarchyNode[];
  showLabels?: boolean;
};

function SunburstPlot({
  nodes,
  showLabels,
}: SunburstChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsSunburst
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      nodes={nodes}
      theme={theme}
      showLabels={showLabels}
      animate={mode === "presentation"}
      mergeOption={mode === "live"}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function SunburstChart({
  nodes,
  showLabels = true,
}: SunburstChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();
  const a11yDescriptor = useMemo(
    () => buildHierarchyA11yDescriptor({ chartType: "sunburst", nodes }),
    [nodes],
  );

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  return (
    <EChartsChartA11yRoot
      descriptor={a11yDescriptor}
      style={{ width: size.width, height: size.height, position: "relative" }}
    >
      <EChartsInteractionShell
        plot={<SunburstPlot nodes={nodes} showLabels={showLabels} />}
      />
    </EChartsChartA11yRoot>
  );
}

export type { HierarchyNode } from "@axicharts/charts-echarts";
