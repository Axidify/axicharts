"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  EChartsPictorialBar,
  type PictorialBarData,
  type PictorialBarItem,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { buildPictorialBarA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type PictorialBarChartProps = {
  items?: PictorialBarItem[];
  data?: PictorialBarData | Record<string, unknown>[];
  symbol?: string;
  symbolRepeat?: boolean;
  barGap?: number | string;
};

function resolvePictorialBarData(
  itemsProp: PictorialBarItem[] | undefined,
  dataProp: PictorialBarData | Record<string, unknown>[] | undefined,
): PictorialBarData {
  if (dataProp && !Array.isArray(dataProp)) {
    return dataProp;
  }

  if (itemsProp) {
    return { items: itemsProp };
  }

  if (Array.isArray(dataProp)) {
    return {
      items: dataProp.map((row) => ({
        category: String(row.category ?? row.name ?? ""),
        value: Number(row.value),
        symbol: row.symbol as string | undefined,
        color: row.color as string | undefined,
        tone: row.tone as PictorialBarItem["tone"],
      })),
    };
  }

  return { items: [] };
}

function PictorialBarPlot({
  data,
  symbol,
  symbolRepeat,
  barGap,
}: {
  data: PictorialBarData;
  symbol?: string;
  symbolRepeat?: boolean;
  barGap?: number | string;
}): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsPictorialBar
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      data={data}
      theme={theme}
      symbol={symbol}
      symbolRepeat={symbolRepeat}
      barGap={barGap}
      onItemHover={interaction.onItemHover}
      mergeOption={mode === "live"}
      animate={mode === "presentation"}
    />
  );
}

export function PictorialBarChart({
  items,
  data: dataProp,
  symbol,
  symbolRepeat,
  barGap,
}: PictorialBarChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();
  const data = useMemo(
    () => resolvePictorialBarData(items, dataProp),
    [items, dataProp],
  );

  const a11yDescriptor = useMemo(
    () => buildPictorialBarA11yDescriptor({ data }),
    [data],
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
          <PictorialBarPlot
            data={data}
            symbol={symbol}
            symbolRepeat={symbolRepeat}
            barGap={barGap}
          />
        }
      />
    </EChartsChartA11yRoot>
  );
}

export type { PictorialBarData, PictorialBarItem } from "@axicharts/charts-echarts";
