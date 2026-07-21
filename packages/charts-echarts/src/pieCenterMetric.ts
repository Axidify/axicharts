import { pieCenter, type PieLabelMode } from "./pieLayout";
import type { PieSlice } from "./types";

export type PieCenterMetric = {
  value: string;
  label?: string;
};

export type PieCenterMetricInput = PieCenterMetric | "largest";

export function resolveLargestSliceMetric(slices: PieSlice[]): PieCenterMetric | undefined {
  if (slices.length === 0) return undefined;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total <= 0) return undefined;
  const largest = slices.reduce((best, slice) => (slice.value > best.value ? slice : best));
  return {
    value: `${Math.round((largest.value / total) * 100)}%`,
    label: largest.name,
  };
}

export function resolvePieCenterMetric(
  slices: PieSlice[],
  input: PieCenterMetricInput,
): PieCenterMetric | undefined {
  if (input === "largest") {
    return resolveLargestSliceMetric(slices);
  }
  if (!input.value) return undefined;
  return input;
}

/** Resolve pie center percent strings to pixel coords. */
export function pieCenterPixels(
  labelMode: PieLabelMode,
  width: number,
  height: number,
): { x: number; y: number } {
  const [cx, cy] = pieCenter(labelMode);
  const xPct = Number.parseFloat(String(cx).replace("%", "")) / 100;
  const yPct = Number.parseFloat(String(cy).replace("%", "")) / 100;
  return {
    x: Math.round(width * (Number.isFinite(xPct) ? xPct : 0.5)),
    y: Math.round(height * (Number.isFinite(yPct) ? yPct : 0.5)),
  };
}
