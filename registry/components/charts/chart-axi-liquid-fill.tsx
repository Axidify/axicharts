"use client";

import {
  ChartContainer,
  LiquidFillChart,
} from "@axicharts/charts/liquid-fill";
import { cleanTheme } from "@axicharts/charts-theme";

export function ChartAxiLiquidFill() {
  return (
    <ChartContainer theme={cleanTheme} height={280} width={320}>
      <LiquidFillChart value={0.72} label="Tank A" />
    </ChartContainer>
  );
}
