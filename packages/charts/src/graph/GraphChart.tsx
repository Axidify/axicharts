"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  EChartsGraph,
  type GraphChartData,
  type GraphLayout,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { buildGraphA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type GraphChartProps = {
  data: GraphChartData;
  layout?: GraphLayout;
  roam?: boolean;
  showLegend?: boolean;
  repulsion?: number;
  edgeLength?: number | [number, number];
};

function GraphPlot({
  data,
  layout,
  roam,
  showLegend,
  repulsion,
  edgeLength,
}: GraphChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsGraph
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      theme={theme}
      data={data}
      layout={layout}
      roam={roam}
      showLegend={showLegend}
      repulsion={repulsion}
      edgeLength={edgeLength}
      onItemHover={interaction.onItemHover}
      mergeOption={mode === "live"}
      animate={mode === "presentation"}
    />
  );
}

export function GraphChart({
  data,
  layout,
  roam,
  showLegend,
  repulsion,
  edgeLength,
}: GraphChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const a11yDescriptor = useMemo(
    () => buildGraphA11yDescriptor({ data }),
    [data],
  );

  return (
    <EChartsChartA11yRoot
      descriptor={a11yDescriptor}
      style={{ width: size.width, height: size.height, position: "relative" }}
    >
      <EChartsInteractionShell
        plot={
          <GraphPlot
            data={data}
            layout={layout}
            roam={roam}
            showLegend={showLegend}
            repulsion={repulsion}
            edgeLength={edgeLength}
          />
        }
      />
    </EChartsChartA11yRoot>
  );
}

export type {
  GraphChartData,
  GraphNode,
  GraphEdge,
  GraphCategory,
  GraphLayout,
} from "@axicharts/charts-echarts";
