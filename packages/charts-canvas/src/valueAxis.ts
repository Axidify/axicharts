import uPlot from "uplot";
import {
  applyYDomain,
  niceTicks,
  resolveValueFormat,
  type ValueFormat,
  type YDomain,
} from "@axicharts/charts-core";

export type ValueAxisOptions = {
  valueFormat?: ValueFormat;
  yDomain?: YDomain;
  yTickCount?: number;
  compact?: boolean;
};

type RangeFn = (u: uPlot, min: number, max: number) => [number, number];

/** Primary value axis: explicit `scale: "y"`, else the second axis (index 1). */
function isPrimaryValueAxis(axis: uPlot.Axis, index: number): boolean {
  return axis.scale === "y" || (axis.scale == null && index === 1);
}

/** Axis width fitted to the widest formatted label (min 32px, the old fixed width). */
function fittedAxisSize(font: string) {
  return (u: uPlot, values: string[] | null): number => {
    if (!values?.length) return 32;
    const ctx = u.ctx;
    ctx.save();
    ctx.font = font;
    const widest = Math.max(...values.map((value) => ctx.measureText(value).width));
    ctx.restore();
    return Math.max(32, Math.ceil(widest) + 12);
  };
}

/**
 * Apply `valueFormat` / `yDomain` / `yTickCount` to finished uPlot options so
 * line, bar and combo renderers share one implementation:
 * - `yDomain` wraps the primary `y` scale's range (or uPlot's auto range).
 * - `valueFormat` formats value-axis ticks and fits the axis width to them
 *   (opt-in, so default layouts and visual baselines don't shift).
 * - `yTickCount` sets round-valued value-axis splits (not in compact tiles, which
 *   use their own quartile splits).
 */
export function applyValueAxisOptions(
  opts: uPlot.Options,
  { valueFormat, yDomain, yTickCount, compact = false }: ValueAxisOptions,
): uPlot.Options {
  const formatter = resolveValueFormat(valueFormat);
  if (!formatter && !yDomain && !yTickCount) return opts;

  const scales = { ...opts.scales };
  if (yDomain) {
    const y = { ...scales.y };
    const base: RangeFn =
      typeof y.range === "function"
        ? (y.range as RangeFn)
        : (_u, min, max) => uPlot.rangeNum(min, max, 0.1, true) as [number, number];
    y.range = (u: uPlot, min: number, max: number) => applyYDomain(base(u, min, max), yDomain);
    y.auto = true;
    scales.y = y;
  }

  const axes = opts.axes?.map((axis, index) => {
    if (!isPrimaryValueAxis(axis, index) || axis.show === false) return axis;
    return {
      ...axis,
      ...(formatter
        ? { values: (_u: uPlot, splits: number[]) => splits.map((value) => formatter(value)) }
        : {}),
      ...(formatter && !compact && typeof axis.font === "string"
        ? { size: fittedAxisSize(axis.font) }
        : {}),
      ...(yTickCount && !compact
        ? {
            splits: (_u: uPlot, _axisIdx: number, min: number, max: number) =>
              niceTicks(min, max, yTickCount),
          }
        : {}),
    };
  });

  return { ...opts, scales, ...(axes ? { axes } : {}) };
}
