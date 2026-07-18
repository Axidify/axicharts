"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  EChartsTreemap,
  type TreemapDrillChange,
  type TreemapNode,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { buildHierarchyA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type TreemapChartProps = {
  nodes: TreemapNode[];
  showLabels?: boolean;
  drilldown?: boolean;
  onDrillChange?: (state: TreemapDrillChange) => void;
};

function TreemapPlot({
  nodes,
  showLabels,
  drilldown,
  onDrillChange,
}: TreemapChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsTreemap
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      nodes={nodes}
      theme={theme}
      showLabels={showLabels}
      drilldown={drilldown}
      onDrillChange={onDrillChange}
      onItemHover={interaction.onItemHover}
      mergeOption={mode === "live"}
      animate={mode === "presentation"}
    />
  );
}

export function TreemapChart({
  nodes,
  showLabels = true,
  drilldown = false,
  onDrillChange,
}: TreemapChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();
  const a11yDescriptor = useMemo(
    () => buildHierarchyA11yDescriptor({ chartType: "treemap", nodes }),
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
        plot={
          <TreemapPlot
            nodes={nodes}
            showLabels={showLabels}
            drilldown={drilldown}
            onDrillChange={onDrillChange}
          />
        }
      />
    </EChartsChartA11yRoot>
  );
}

export type { TreemapDrillChange, TreemapNode } from "@axicharts/charts-echarts";
