import type { ChartTheme } from "@axicharts/charts-theme";
import { toneColor } from "./themeBridge";
import type { WaterfallItem } from "./types";

export type WaterfallConnector = [
  { coord: [string, number] },
  { coord: [string, number] },
];

export type WaterfallBarKind = "total" | "positive" | "negative";

export type WaterfallBridge = {
  placeholders: number[];
  values: number[];
  colors: string[];
  labels: string[];
  connectors: WaterfallConnector[];
  /** Signed delta or total value for label display. */
  displayValues: number[];
  isTotals: boolean[];
  kinds: WaterfallBarKind[];
};

function totalBarColor(theme?: Pick<ChartTheme, "tokens">): string {
  return toneColor("default", theme);
}

function deltaColor(
  delta: number,
  item: WaterfallItem,
  theme?: Pick<ChartTheme, "tokens">,
): string {
  if (item.tone) {
    return toneColor(item.tone, theme);
  }
  return delta >= 0
    ? toneColor("success", theme)
    : toneColor("critical", theme);
}

export function buildWaterfallBridge(
  items: WaterfallItem[],
  theme?: Pick<ChartTheme, "tokens">,
): WaterfallBridge {
  const placeholders: number[] = [];
  const values: number[] = [];
  const colors: string[] = [];
  const labels: string[] = [];
  const connectors: WaterfallConnector[] = [];
  const displayValues: number[] = [];
  const isTotals: boolean[] = [];
  const kinds: WaterfallBarKind[] = [];
  const levels: number[] = [];
  let running = 0;

  for (const item of items) {
    labels.push(item.name);

    if (item.isTotal) {
      const displayValue = running === 0 ? item.value : running;
      placeholders.push(0);
      values.push(displayValue);
      colors.push(item.tone ? toneColor(item.tone, theme) : totalBarColor(theme));
      displayValues.push(displayValue);
      isTotals.push(true);
      kinds.push("total");
      levels.push(displayValue);
      running = item.value;
      continue;
    }

    const delta = item.value;
    displayValues.push(delta);
    isTotals.push(false);
    kinds.push(delta >= 0 ? "positive" : "negative");

    if (delta >= 0) {
      placeholders.push(running);
      values.push(delta);
      colors.push(deltaColor(delta, item, theme));
      running += delta;
    } else {
      placeholders.push(running + delta);
      values.push(Math.abs(delta));
      colors.push(deltaColor(delta, item, theme));
      running += delta;
    }
    levels.push(running);
  }

  for (let index = 0; index < labels.length - 1; index += 1) {
    connectors.push([
      { coord: [labels[index]!, levels[index]!] },
      { coord: [labels[index + 1]!, levels[index]!] },
    ]);
  }

  return {
    placeholders,
    values,
    colors,
    labels,
    connectors,
    displayValues,
    isTotals,
    kinds,
  };
}
