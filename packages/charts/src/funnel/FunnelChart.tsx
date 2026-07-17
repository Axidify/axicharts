"use client";

import type { ReactElement } from "react";
import {
  EChartsFunnel,
  type FunnelStage,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";

export type FunnelChartProps = {
  stages: FunnelStage[];
  sort?: "ascending" | "descending" | "none";
};

function FunnelPlot({
  stages,
  sort,
}: FunnelChartProps): ReactElement {
  const { size, theme } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsFunnel
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      stages={stages}
      theme={theme}
      sort={sort}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function FunnelChart({
  stages,
  sort = "descending",
}: FunnelChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  return (
    <EChartsInteractionShell
      plot={<FunnelPlot stages={stages} sort={sort} />}
    />
  );
}

export type { FunnelStage } from "@axicharts/charts-echarts";
