import { toneColor } from "./themeBridge";
import type { WaterfallItem } from "./types";

export type WaterfallConnector = [
  { coord: [string, number] },
  { coord: [string, number] },
];

export type WaterfallBridge = {
  placeholders: number[];
  values: number[];
  colors: string[];
  labels: string[];
  connectors: WaterfallConnector[];
};

export function buildWaterfallBridge(items: WaterfallItem[]): WaterfallBridge {
  const placeholders: number[] = [];
  const values: number[] = [];
  const colors: string[] = [];
  const labels: string[] = [];
  const connectors: WaterfallConnector[] = [];
  const levels: number[] = [];
  let running = 0;

  for (const item of items) {
    labels.push(item.name);

    if (item.isTotal) {
      const displayValue = running === 0 ? item.value : running;
      placeholders.push(0);
      values.push(displayValue);
      colors.push(toneColor(item.tone ?? "default"));
      levels.push(displayValue);
      running = item.value;
      continue;
    }

    const delta = item.value;
    if (delta >= 0) {
      placeholders.push(running);
      values.push(delta);
      colors.push(toneColor(item.tone ?? "success"));
      running += delta;
    } else {
      placeholders.push(running + delta);
      values.push(Math.abs(delta));
      colors.push(toneColor(item.tone ?? "critical"));
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

  return { placeholders, values, colors, labels, connectors };
}
