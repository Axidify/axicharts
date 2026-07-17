"use client";

import type { ReactElement } from "react";
import {
  EChartsWaterfall,
  type WaterfallItem,
} from "@axicharts/charts-echarts";
import { formatTick } from "@axicharts/charts-core";
import { useChartLayout } from "../container/ChartLayoutContext";
import {
  CartesianChartShell,
} from "../chrome/CartesianChartShell";
import type { TooltipRow } from "../chrome/Tooltip";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";

export type WaterfallChartProps = {
  items: WaterfallItem[];
  valueFormat?: "currency" | "number" | "compact";
};

function WaterfallPlot({
  items,
  valueFormat,
}: {
  items: WaterfallItem[];
  valueFormat: WaterfallChartProps["valueFormat"];
}): ReactElement {
  const { size, theme } = useChartLayout();
  const interaction = useEChartsInteraction();
  const formatValue = (value: number) => formatTick(value, valueFormat ?? "currency");

  return (
    <EChartsWaterfall
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      items={items}
      theme={theme}
      valueFormat={formatValue}
      onCursor={interaction.onCursor}
    />
  );
}

export function WaterfallChart({
  items,
  valueFormat = "currency",
}: WaterfallChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();
  const categories = items.map((item) => item.name);
  const formatValue = (value: number) => formatTick(value, valueFormat);

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  return (
    <div
      style={{
        width: size.width,
        height: size.height,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CartesianChartShell
        categories={categories}
        getRows={(index): TooltipRow[] | null => {
          const item = items[index];
          if (!item) return null;
          return [
            {
              label: item.isTotal ? "Total" : "Δ",
              value: formatValue(item.value),
            },
          ];
        }}
        plot={<WaterfallPlot items={items} valueFormat={valueFormat} />}
      />
    </div>
  );
}

export type { WaterfallItem } from "@axicharts/charts-echarts";
