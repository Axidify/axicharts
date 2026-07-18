"use client";

import {
  ChartContainer,
  PictorialBarChart,
  type PictorialBarItem,
} from "@axicharts/charts/pictorial-bar";
import { cleanTheme } from "@axicharts/charts-theme";

const SAMPLE_ITEMS: PictorialBarItem[] = [
  { category: "CPU", value: 72, symbol: "roundRect" },
  { category: "Memory", value: 58, symbol: "rect" },
  { category: "Storage", value: 41, symbol: "triangle" },
];

export function ChartAxiPictorialBar() {
  return (
    <ChartContainer theme={cleanTheme} height={260} width="100%">
      <PictorialBarChart items={SAMPLE_ITEMS} />
    </ChartContainer>
  );
}
