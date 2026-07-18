"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  EChartsParallel,
  type ParallelDimension,
  type ParallelSeries,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { buildParallelA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type ParallelChartProps = {
  dimensions: ParallelDimension[];
  series: ParallelSeries[];
  showAxes?: boolean;
  lineOpacity?: number;
};

function ParallelPlot({
  dimensions,
  series,
  showAxes,
  lineOpacity,
}: ParallelChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsParallel
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      theme={theme}
      dimensions={dimensions}
      series={series}
      showAxes={showAxes}
      lineOpacity={lineOpacity}
      onItemHover={interaction.onItemHover}
      mergeOption={mode === "live"}
      animate={mode === "presentation"}
    />
  );
}

export function ParallelChart({
  dimensions,
  series,
  showAxes,
  lineOpacity,
}: ParallelChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const axes = showAxes ?? theme.axis.show;
  const a11yDescriptor = useMemo(
    () => buildParallelA11yDescriptor({ dimensions, series }),
    [dimensions, series],
  );

  return (
    <EChartsChartA11yRoot
      descriptor={a11yDescriptor}
      style={{ width: size.width, height: size.height, position: "relative" }}
    >
      <EChartsInteractionShell
        plot={
          <ParallelPlot
            dimensions={dimensions}
            series={series}
            showAxes={axes}
            lineOpacity={lineOpacity}
          />
        }
      />
    </EChartsChartA11yRoot>
  );
}

export type { ParallelDimension, ParallelSeries } from "@axicharts/charts-echarts";
