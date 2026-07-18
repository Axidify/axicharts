"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  EChartsViolin,
  type ViolinItem,
  type ViolinSeries,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { buildViolinA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type ViolinChartProps = {
  items?: ViolinItem[];
  series?: ViolinSeries[];
  showAxes?: boolean;
  valueSuffix?: string;
  bandwidth?: number;
  showBoxplot?: boolean;
  showMedianLine?: boolean;
};

function ViolinPlot({
  items,
  series,
  showAxes,
  valueSuffix,
  bandwidth,
  showBoxplot,
  showMedianLine,
}: ViolinChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsViolin
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      theme={theme}
      items={items}
      series={series}
      showAxes={showAxes}
      valueSuffix={valueSuffix}
      bandwidth={bandwidth}
      showBoxplot={showBoxplot}
      showMedianLine={showMedianLine}
      animate={mode === "presentation"}
      mergeOption={mode === "live"}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function ViolinChart({
  items,
  series,
  showAxes,
  valueSuffix,
  bandwidth,
  showBoxplot,
  showMedianLine,
}: ViolinChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const axes = showAxes ?? theme.axis.show;
  const a11yDescriptor = useMemo(
    () => buildViolinA11yDescriptor({ items, series }),
    [items, series],
  );

  return (
    <EChartsChartA11yRoot
      descriptor={a11yDescriptor}
      style={{ width: size.width, height: size.height, position: "relative" }}
    >
      <EChartsInteractionShell
        plot={
          <ViolinPlot
            items={items}
            series={series}
            showAxes={axes}
            valueSuffix={valueSuffix}
            bandwidth={bandwidth}
            showBoxplot={showBoxplot}
            showMedianLine={showMedianLine}
          />
        }
      />
    </EChartsChartA11yRoot>
  );
}

export type { ViolinItem, ViolinSeries } from "@axicharts/charts-echarts";
