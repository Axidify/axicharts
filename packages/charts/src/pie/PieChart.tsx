"use client";

import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import { EChartsPie, type PieCenterMetricInput, type PieSlice } from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { useResolvedPieProps } from "../composable/resolvePieProps";
import { applyChartConfigToPieSlices } from "../config/applyChartConfig";
import { buildPieA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type PieChartProps = {
  slices?: PieSlice[];
  graphics?: ChartGraphicElement[];
  data?: Record<string, unknown>[];
  children?: ReactNode;
  innerRadius?: number;
  showLabels?: boolean;
  centerMetric?: PieCenterMetricInput;
};

function PiePlot({
  slices,
  innerRadius,
  showLabels,
  centerMetric,
  graphics,
}: {
  slices: PieSlice[];
  innerRadius?: number;
  showLabels?: boolean;
  centerMetric?: PieCenterMetricInput;
  graphics?: ChartGraphicElement[];
}): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsPie
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      slices={slices}
      theme={theme}
      innerRadius={innerRadius}
      showLabels={showLabels}
      centerMetric={centerMetric}
      graphics={graphics}
      animate={mode === "presentation"}
      mergeOption={mode === "live"}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function PieChart({
  slices: slicesProp,
  data,
  children,
  innerRadius: innerRadiusProp,
  showLabels: showLabelsProp,
  centerMetric: centerMetricProp,
  graphics,
}: PieChartProps): ReactElement | null {
  const { size, ready, config } = useChartLayout();
  const { slices: resolvedSlices, innerRadius, showLabels, centerMetric } = useResolvedPieProps(
    {
      slices: slicesProp,
      data,
      children,
      innerRadius: innerRadiusProp,
      showLabels: showLabelsProp,
      centerMetric: centerMetricProp,
    },
    config,
  );
  const slices = useMemo(
    () => applyChartConfigToPieSlices(resolvedSlices, config),
    [resolvedSlices, config],
  );
  const a11yDescriptor = useMemo(
    () => buildPieA11yDescriptor({ slices, innerRadius }),
    [slices, innerRadius],
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
          <PiePlot
            slices={slices}
            innerRadius={innerRadius}
            showLabels={showLabels}
            centerMetric={centerMetric}
            graphics={graphics}
          />
        }
      />
    </EChartsChartA11yRoot>
  );
}

export type { PieSlice } from "@axicharts/charts-echarts";
