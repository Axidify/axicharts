"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  EChartsRidgeline,
  type RidgelineItem,
  type RidgelineSeries,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { buildRidgelineA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type RidgelineChartProps = {
  items?: RidgelineItem[];
  series?: RidgelineSeries[];
  showAxes?: boolean;
  valueSuffix?: string;
  bandwidth?: number;
  ridgeHeight?: number;
  showMedianLine?: boolean;
};

function RidgelinePlot({
  items,
  series,
  showAxes,
  valueSuffix,
  bandwidth,
  ridgeHeight,
  showMedianLine,
}: RidgelineChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsRidgeline
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      theme={theme}
      items={items}
      series={series}
      showAxes={showAxes}
      valueSuffix={valueSuffix}
      bandwidth={bandwidth}
      ridgeHeight={ridgeHeight}
      showMedianLine={showMedianLine}
      animate={mode === "presentation"}
      mergeOption={mode === "live"}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function RidgelineChart({
  items,
  series,
  showAxes,
  valueSuffix,
  bandwidth,
  ridgeHeight,
  showMedianLine,
}: RidgelineChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const axes = showAxes ?? theme.axis.show;
  const a11yDescriptor = useMemo(
    () => buildRidgelineA11yDescriptor({ items, series }),
    [items, series],
  );

  return (
    <EChartsChartA11yRoot
      descriptor={a11yDescriptor}
      style={{ width: size.width, height: size.height, position: "relative" }}
    >
      <EChartsInteractionShell
        plot={
          <RidgelinePlot
            items={items}
            series={series}
            showAxes={axes}
            valueSuffix={valueSuffix}
            bandwidth={bandwidth}
            ridgeHeight={ridgeHeight}
            showMedianLine={showMedianLine}
          />
        }
      />
    </EChartsChartA11yRoot>
  );
}

export type { RidgelineItem, RidgelineSeries } from "@axicharts/charts-echarts";
