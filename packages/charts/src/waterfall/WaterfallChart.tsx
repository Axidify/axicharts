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
  showLabels?: boolean;
  showSigns?: boolean;
  connectorStyle?: "solid" | "dashed";
};

function WaterfallPlot({
  items,
  valueFormat,
  showLabels,
  showSigns,
  connectorStyle,
}: {
  items: WaterfallItem[];
  valueFormat: WaterfallChartProps["valueFormat"];
  showLabels?: boolean;
  showSigns?: boolean;
  connectorStyle?: "solid" | "dashed";
}): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();
  const formatValue = (value: number) => formatTick(value, valueFormat ?? "currency");

  return (
    <EChartsWaterfall
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      items={items}
      theme={theme}
      valueFormat={formatValue}
      showLabels={showLabels}
      showSigns={showSigns}
      connectorStyle={connectorStyle}
      animate={mode === "presentation"}
      onCursor={interaction.onCursor}
    />
  );
}

export function WaterfallChart({
  items,
  valueFormat = "currency",
  showLabels = true,
  showSigns = true,
  connectorStyle = "dashed",
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
        plot={
          <WaterfallPlot
            items={items}
            valueFormat={valueFormat}
            showLabels={showLabels}
            showSigns={showSigns}
            connectorStyle={connectorStyle}
          />
        }
      />
    </div>
  );
}

export type { WaterfallItem } from "@axicharts/charts-echarts";
