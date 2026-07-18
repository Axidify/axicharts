"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  EChartsSwarm,
  type SwarmItem,
  type SwarmSeries,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { buildSwarmA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type SwarmChartProps = {
  items?: SwarmItem[];
  series?: SwarmSeries[];
  showAxes?: boolean;
  valueSuffix?: string;
  pointRadius?: number;
  pointOpacity?: number;
  jitterWidth?: number;
  showMedianLine?: boolean;
};

function SwarmPlot({
  items,
  series,
  showAxes,
  valueSuffix,
  pointRadius,
  pointOpacity,
  jitterWidth,
  showMedianLine,
}: SwarmChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsSwarm
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      theme={theme}
      items={items}
      series={series}
      showAxes={showAxes}
      valueSuffix={valueSuffix}
      pointRadius={pointRadius}
      pointOpacity={pointOpacity}
      jitterWidth={jitterWidth}
      showMedianLine={showMedianLine}
      animate={mode === "presentation"}
      mergeOption={mode === "live"}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function SwarmChart({
  items,
  series,
  showAxes,
  valueSuffix,
  pointRadius,
  pointOpacity,
  jitterWidth,
  showMedianLine,
}: SwarmChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const axes = showAxes ?? theme.axis.show;
  const a11yDescriptor = useMemo(
    () => buildSwarmA11yDescriptor({ items, series }),
    [items, series],
  );

  return (
    <EChartsChartA11yRoot
      descriptor={a11yDescriptor}
      style={{ width: size.width, height: size.height, position: "relative" }}
    >
      <EChartsInteractionShell
        plot={
          <SwarmPlot
            items={items}
            series={series}
            showAxes={axes}
            valueSuffix={valueSuffix}
            pointRadius={pointRadius}
            pointOpacity={pointOpacity}
            jitterWidth={jitterWidth}
            showMedianLine={showMedianLine}
          />
        }
      />
    </EChartsChartA11yRoot>
  );
}

export type { SwarmItem, SwarmSeries } from "@axicharts/charts-echarts";
