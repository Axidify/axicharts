import { brushRangeFromIndices } from "@axicharts/charts-canvas";
import type { BrushRange } from "../sync/brushRange";

export type NavigatorPreset = "1D" | "1W" | "1M" | "ALL";

export const DEFAULT_NAVIGATOR_PRESETS: NavigatorPreset[] = [
  "1D",
  "1W",
  "1M",
  "ALL",
];

const MS_PER_DAY = 86_400_000;

const WINDOW_MS: Record<Exclude<NavigatorPreset, "ALL">, number> = {
  "1D": MS_PER_DAY,
  "1W": 7 * MS_PER_DAY,
  "1M": 30 * MS_PER_DAY,
};

const INDEX_FRACTIONS: Record<Exclude<NavigatorPreset, "ALL">, number> = {
  "1D": 0.05,
  "1W": 0.25,
  "1M": 0.5,
};

function parseCategoryTimestamp(category: string): number | null {
  const trimmed = category.trim();
  if (!trimmed) return null;

  const parsed = Date.parse(trimmed);
  if (Number.isFinite(parsed)) return parsed;

  const timeMatch = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);
  if (timeMatch) {
    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const seconds = Number(timeMatch[3] ?? 0);
    return ((hours * 60 + minutes) * 60 + seconds) * 1000;
  }

  return null;
}

function parseCategoryTimestamps(categories: string[]): number[] | null {
  const timestamps = categories.map(parseCategoryTimestamp);
  const validCount = timestamps.filter((value) => value != null).length;
  if (validCount < categories.length * 0.5) {
    return null;
  }

  const fallback = timestamps.find((value) => value != null) ?? 0;
  return timestamps.map((value) => value ?? fallback);
}

function brushRangeFromTimePreset(
  preset: Exclude<NavigatorPreset, "ALL">,
  timestamps: number[],
): BrushRange {
  const total = timestamps.length;
  if (total === 0) {
    return { start: 0, end: 100 };
  }

  const endTs = timestamps[total - 1]!;
  const startTs = endTs - WINDOW_MS[preset];

  let startIndex = 0;
  for (let index = 0; index < total; index += 1) {
    if ((timestamps[index] ?? 0) >= startTs) {
      startIndex = index;
      break;
    }
  }

  return brushRangeFromIndices(startIndex, total - 1, total);
}

function brushRangeFromIndexPreset(
  preset: Exclude<NavigatorPreset, "ALL">,
  total: number,
): BrushRange {
  if (total === 0) {
    return { start: 0, end: 100 };
  }

  const span = Math.max(1, Math.ceil(total * INDEX_FRACTIONS[preset]));
  const startIndex = Math.max(0, total - span);
  return brushRangeFromIndices(startIndex, total - 1, total);
}

/** Map a preset label to a percent brush range for the given categories. */
export function brushRangeForPreset(
  preset: NavigatorPreset,
  categories: string[],
): BrushRange {
  if (categories.length === 0 || preset === "ALL") {
    return { start: 0, end: 100 };
  }

  const timestamps = parseCategoryTimestamps(categories);
  if (timestamps) {
    return brushRangeFromTimePreset(preset, timestamps);
  }

  return brushRangeFromIndexPreset(preset, categories.length);
}
