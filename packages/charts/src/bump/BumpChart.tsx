"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  EChartsBump,
  type BumpChartData,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { buildBumpA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type BumpChartProps = {
  data: BumpChartData;
  maxRank?: number;
  showLabels?: boolean;
  showAxes?: boolean;
  smooth?: boolean;
};

function BumpPlot({
  data,
  maxRank,
  showLabels,
  showAxes,
  smooth,
}: BumpChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsBump
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      theme={theme}
      data={data}
      maxRank={maxRank}
      showLabels={showLabels}
      showAxes={showAxes}
      smooth={smooth}
      onItemHover={interaction.onItemHover}
      mergeOption={mode === "live"}
      animate={mode === "presentation"}
    />
  );
}

export function BumpChart({
  data,
  maxRank,
  showLabels,
  showAxes,
  smooth,
}: BumpChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const axes = showAxes ?? theme.axis.show;
  const a11yDescriptor = useMemo(
    () => buildBumpA11yDescriptor({ data }),
    [data],
  );

  return (
    <EChartsChartA11yRoot
      descriptor={a11yDescriptor}
      style={{ width: size.width, height: size.height, position: "relative" }}
    >
      <EChartsInteractionShell
        plot={
          <BumpPlot
            data={data}
            maxRank={maxRank}
            showLabels={showLabels}
            showAxes={axes}
            smooth={smooth}
          />
        }
      />
    </EChartsChartA11yRoot>
  );
}

export type { BumpChartData, BumpSeries } from "@axicharts/charts-echarts";
