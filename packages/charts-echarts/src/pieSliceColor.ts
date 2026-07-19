import type { ChartTheme } from "@axicharts/charts-theme";
import { toneColor } from "./themeBridge";
import type { PieSlice } from "./types";

/** Resolve slice fill — only apply tone when explicitly set so palette cycles per slice. */
export function resolvePieSliceColor(
  slice: PieSlice,
  index: number,
  palette: string[],
  theme: ChartTheme,
): string {
  if (slice.color) return slice.color;
  if (slice.tone) return toneColor(slice.tone, theme);
  return palette[index % palette.length]!;
}
