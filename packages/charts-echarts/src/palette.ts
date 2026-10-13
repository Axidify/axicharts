import type { ChartTheme } from "@axicharts/charts-theme";
import {
  contrastRatio,
  parseRgbString,
  resolveChartPalette,
  resolveToneColors,
} from "@axicharts/charts-theme";
import { echartsColor, echartsPalette } from "./echartsColor";
import type { SeriesTone } from "./types";

export type { SeriesTone };

export function seriesPalette(theme?: Pick<ChartTheme, "tokens">): string[] {
  return echartsPalette(resolveChartPalette(theme));
}

/**
 * Theme color for an explicit tone. Returns `undefined` when no tone is set so
 * callers' `toneColor(item.tone) ?? palette[i]` falls back to the series
 * palette — defaulting to the "default" tone made every untoned series,
 * segment and node render the same first-palette color.
 */
export function toneColor(tone: SeriesTone, theme?: Pick<ChartTheme, "tokens">): string;
export function toneColor(
  tone: SeriesTone | undefined,
  theme?: Pick<ChartTheme, "tokens">,
): string | undefined;
export function toneColor(
  tone: SeriesTone | undefined,
  theme?: Pick<ChartTheme, "tokens">,
): string | undefined {
  if (!tone) return undefined;
  const colors = resolveToneColors(theme);
  return echartsColor(colors[tone] ?? colors.default);
}

export { SERIES_PALETTE, SERIES_COLORS } from "./types";

const LABEL_DARK = "#0f172a";
const LABEL_LIGHT = "#ffffff";
const LABEL_DARK_RGB = { r: 15, g: 23, b: 42 };
const LABEL_LIGHT_RGB = { r: 255, g: 255, b: 255 };

/**
 * Dark or white label text, whichever contrasts more with `fill`. No single
 * label color works across the palette (dark wins on cyan/green/amber, white on
 * blue/violet/red), so segment labels pick per fill.
 */
export function readableLabelColor(fill: string): string {
  const rgb = parseRgbString(fill);
  if (!rgb) return LABEL_DARK;
  return contrastRatio(LABEL_LIGHT_RGB, rgb) > contrastRatio(LABEL_DARK_RGB, rgb)
    ? LABEL_LIGHT
    : LABEL_DARK;
}
