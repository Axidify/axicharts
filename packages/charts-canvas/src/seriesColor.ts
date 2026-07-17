import type { SeriesTone } from "./types";
import { SERIES_COLORS } from "./colors";

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
): string {
  return SERIES_COLORS[resolveSeriesTone(tone, index)];
}
