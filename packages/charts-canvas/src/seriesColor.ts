import type { ChartTheme } from "@axicharts/charts-theme";
import {
  resolveChartPalette,
  resolveToneColors,
} from "@axicharts/charts-theme";
import type { SeriesTone } from "./types";

const SERIES_TONE_CYCLE: SeriesTone[] = [
  "default",
  "info",
  "success",
  "warning",
  "critical",
];

export function resolveSeriesTone(
  tone: SeriesTone | undefined,
  index: number,
): SeriesTone {
  return tone ?? SERIES_TONE_CYCLE[index % SERIES_TONE_CYCLE.length]!;
}

export function resolveSeriesColor(
  tone: SeriesTone | undefined,
  index: number,
  theme?: Pick<ChartTheme, "tokens">,
): string {
  const toneColors = resolveToneColors(theme);
  if (tone && tone !== "default" && tone in toneColors) {
    return toneColors[tone as SeriesTone];
  }
  const palette = resolveChartPalette(theme);
  return palette[index % palette.length]!;
}
