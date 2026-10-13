import type { KdePoint } from "./violinTypes";

/**
 * Value-axis bounds for KDE custom series (violin, ridgeline). Their series
 * `value` only carries the category index, so ECharts can't infer the value
 * axis extent from data — without explicit bounds the axis spans the category
 * indices and shapes land off-plot.
 */
export function kdeValueExtent(
  shapes: ReadonlyArray<{ kdePoints: KdePoint[] }>,
): { min: number; max: number } | undefined {
  let min = Infinity;
  let max = -Infinity;
  for (const shape of shapes) {
    for (const point of shape.kdePoints) {
      if (!Number.isFinite(point.value)) continue;
      min = Math.min(min, point.value);
      max = Math.max(max, point.value);
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;
  if (min === max) return { min: min - 1, max: max + 1 };
  return { min, max };
}
