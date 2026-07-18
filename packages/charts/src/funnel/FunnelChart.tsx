"use client";

import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import {
  EChartsFunnel,
  type FunnelStage,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { useResolvedFunnelProps } from "../composable/resolveFunnelProps";
import { applyChartConfigToFunnelStages } from "../config/applyChartConfig";
import { buildFunnelA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type FunnelChartProps = {
  stages?: FunnelStage[];
  data?: Record<string, unknown>[];
  children?: ReactNode;
  sort?: "ascending" | "descending" | "none";
};

function FunnelPlot({
  stages,
  sort,
}: {
  stages: FunnelStage[];
  sort?: "ascending" | "descending" | "none";
}): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsFunnel
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      stages={stages}
      theme={theme}
      sort={sort}
      onItemHover={interaction.onItemHover}
      mergeOption={mode === "live"}
      animate={mode === "presentation"}
    />
  );
}

export function FunnelChart({
  stages: stagesProp,
  data,
  children,
  sort: sortProp = "descending",
}: FunnelChartProps): ReactElement | null {
  const { size, ready, config } = useChartLayout();
  const { stages: resolvedStages, sort } = useResolvedFunnelProps(
    {
      stages: stagesProp,
      data,
      children,
      sort: sortProp,
    },
    config,
  );
  const stages = useMemo(
    () => applyChartConfigToFunnelStages(resolvedStages, config),
    [resolvedStages, config],
  );
  const a11yDescriptor = useMemo(
    () => buildFunnelA11yDescriptor({ stages }),
    [stages],
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
        plot={<FunnelPlot stages={stages} sort={sort ?? sortProp} />}
      />
    </EChartsChartA11yRoot>
  );
}

export type { FunnelStage } from "@axicharts/charts-echarts";
