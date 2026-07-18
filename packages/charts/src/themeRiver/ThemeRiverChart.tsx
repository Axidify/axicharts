"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  EChartsThemeRiver,
  type ThemeRiverPoint,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { buildThemeRiverA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type ThemeRiverChartProps = {
  points: ThemeRiverPoint[];
  showAxes?: boolean;
};

function ThemeRiverPlot({
  points,
  showAxes,
}: ThemeRiverChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsThemeRiver
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      theme={theme}
      points={points}
      showAxes={showAxes}
      onItemHover={interaction.onItemHover}
      mergeOption={mode === "live"}
      animate={mode === "presentation"}
    />
  );
}

export function ThemeRiverChart({
  points,
  showAxes,
}: ThemeRiverChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const axes = showAxes ?? theme.axis.show;
  const a11yDescriptor = useMemo(
    () => buildThemeRiverA11yDescriptor({ points }),
    [points],
  );

  return (
    <EChartsChartA11yRoot
      descriptor={a11yDescriptor}
      style={{ width: size.width, height: size.height, position: "relative" }}
    >
      <EChartsInteractionShell
        plot={<ThemeRiverPlot points={points} showAxes={axes} />}
      />
    </EChartsChartA11yRoot>
  );
}

export type { ThemeRiverPoint } from "@axicharts/charts-echarts";
