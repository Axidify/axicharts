"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  EChartsLiquidFill,
  normalizeLiquidFillValue,
  type LiquidFillShape,
} from "@axicharts/charts-echarts";
import type { SeriesTone } from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { buildSingleValueA11yDescriptor } from "../a11y/singleValueDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type LiquidFillChartProps = {
  value: number;
  label?: string;
  waves?: number[];
  color?: string;
  tone?: SeriesTone;
  shape?: LiquidFillShape;
  waveAnimation?: boolean;
};

function LiquidFillPlot({
  value,
  label,
  waves,
  color,
  tone,
  shape,
  waveAnimation,
}: LiquidFillChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();

  return (
    <EChartsLiquidFill
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      theme={theme}
      value={value}
      label={label}
      waves={waves}
      color={color}
      tone={tone}
      shape={shape}
      waveAnimation={mode === "live" ? false : waveAnimation}
      mergeOption={mode === "live"}
      animate={mode === "presentation"}
    />
  );
}

export function LiquidFillChart({
  value,
  label,
  waves,
  color,
  tone,
  shape,
  waveAnimation,
}: LiquidFillChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();
  const normalized = normalizeLiquidFillValue(value);
  const display = `${Math.round(normalized * 100)}%`;

  const a11yDescriptor = useMemo(
    () =>
      buildSingleValueA11yDescriptor({
        title: label ?? "Liquid fill",
        value: display,
        description: shape ? `Shape: ${shape}` : undefined,
      }),
    [display, label, shape],
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
          <LiquidFillPlot
            value={value}
            label={label}
            waves={waves}
            color={color}
            tone={tone}
            shape={shape}
            waveAnimation={waveAnimation}
          />
        }
      />
    </EChartsChartA11yRoot>
  );
}

export type { LiquidFillShape } from "@axicharts/charts-echarts";
