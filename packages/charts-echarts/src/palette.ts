import type { ChartTheme } from "@axicharts/charts-theme";
import {
  resolveChartPalette,
  resolveToneColors,
} from "@axicharts/charts-theme";
import { echartsColor, echartsPalette } from "./echartsColor";
import type { SeriesTone } from "./types";

export type { SeriesTone };

export function seriesPalette(theme?: Pick<ChartTheme, "tokens">): string[] {
  return echartsPalette(resolveChartPalette(theme));
}

export function toneColor(
  tone: SeriesTone = "default",
  theme?: Pick<ChartTheme, "tokens">,
): string {
  return echartsColor(resolveToneColors(theme)[tone]);
}

export { SERIES_PALETTE, SERIES_COLORS } from "./types";
