"use client";

import { useMemo, useRef, type ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import {
  axisLabelStyle,
  hiddenTooltip,
  seriesPalette,
  toneColor,
  type SeriesTone,
} from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart } from "./useEChart";
import { useLiquidFillExtension } from "./useLiquidFillExtension";

export type LiquidFillShape =
  | "circle"
  | "rect"
  | "roundRect"
  | "triangle"
  | "diamond"
  | "pin";

export type EChartsLiquidFillProps = {
  width: number;
  height: number;
  theme: ChartTheme;
  value: number;
  label?: string;
  waves?: number[];
  color?: string;
  tone?: SeriesTone;
  shape?: LiquidFillShape;
  waveAnimation?: boolean;
  mergeOption?: boolean;
  graphics?: ChartGraphicElement[];
  animate?: boolean;
};

export function normalizeLiquidFillValue(value: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  const normalized = numeric > 1 ? numeric / 100 : numeric;
  return Math.min(1, Math.max(0, normalized));
}

function EChartsLiquidFillPlot({
  width,
  height,
  theme,
  value,
  label,
  waves,
  color,
  tone,
  shape = "circle",
  waveAnimation,
  mergeOption = false,
  graphics,
  animate = false,
}: EChartsLiquidFillProps): ReactElement {
  const palette = seriesPalette(theme);
  const normalized = normalizeLiquidFillValue(value);
  const fillData = useMemo(
    () =>
      waves?.length ? waves.map(normalizeLiquidFillValue) : [normalized],
    [waves, normalized],
  );
  const layoutKey = `${shape}:${label ?? ""}`;
  const layoutKeyRef = useRef<string | null>(null);
  const valueOnlyLiveMerge =
    mergeOption &&
    layoutKeyRef.current !== null &&
    layoutKeyRef.current === layoutKey;
  layoutKeyRef.current = layoutKey;

  const fillColor =
    color ??
    (tone ? toneColor(tone, theme) : undefined) ??
    palette[0] ??
    "#3b82f6";
  const displayPct = Math.round(normalized * 100);
  const labelColor = axisLabelStyle(theme).color;

  const option: EChartsOption = withPresentationAnimation(
    {
      tooltip: hiddenTooltip(),
      series: [
        {
          type: "liquidFill",
          data: fillData,
          radius: "88%",
          shape,
          color: [fillColor],
          outline: {
            show: true,
            borderDistance: 4,
            itemStyle: {
              borderColor: fillColor,
              borderWidth: 2,
            },
          },
          backgroundStyle: {
            color: "transparent",
          },
          label: {
            show: true,
            fontSize: 28,
            fontWeight: 700,
            color: labelColor,
            formatter: label ? `${displayPct}%\n${label}` : `${displayPct}%`,
          },
          waveAnimation:
            waveAnimation ?? (animate && !mergeOption),
          animationDurationUpdate: mergeOption ? 0 : undefined,
        },
      ] as EChartsOption["series"],
    },
    animate,
  );

  const rootRef = useEChart({
    option,
    graphics,
    width,
    height,
    mergeOption: mergeOption ?? !animate,
    replaceMerge: valueOnlyLiveMerge
      ? null
      : mergeOption
        ? ["series"]
        : undefined,
  });

  return (
    <div
      ref={rootRef}
      className="axicharts-echarts"
      style={{ width, height, background: "transparent" }}
    />
  );
}

export function EChartsLiquidFill(props: EChartsLiquidFillProps): ReactElement {
  const extensionReady = useLiquidFillExtension();

  if (!extensionReady) {
    return (
      <div
        className="axicharts-echarts"
        style={{
          width: props.width,
          height: props.height,
          background: "transparent",
        }}
        aria-hidden="true"
      />
    );
  }

  return <EChartsLiquidFillPlot {...props} />;
}
