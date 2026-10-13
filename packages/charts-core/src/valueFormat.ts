import { formatTick, type BuiltinTickFormat } from "./formatters";

/**
 * Value formatting shared by Y ticks, tooltips and value labels: a built-in or
 * registered (`registerTickFormat`) format id, or a function.
 */
export type ValueFormat =
  | BuiltinTickFormat
  | (string & Record<never, never>)
  | ((value: number) => string);

/** Resolve a `ValueFormat` to a function, or `undefined` when unset. */
export function resolveValueFormat(
  format: ValueFormat | undefined,
  locale?: string,
): ((value: number) => string) | undefined {
  if (format == null) return undefined;
  if (typeof format === "function") return format;
  return (value) => formatTick(value, format, locale);
}

/**
 * Tooltip / value-label text. Without a format this keeps the historical
 * rounding (integers ≥ 100, one decimal below); `suffix` is always appended.
 */
export function formatChartValue(
  value: number,
  { format, suffix = "" }: { format?: ValueFormat; suffix?: string } = {},
): string {
  const formatter = resolveValueFormat(format);
  if (formatter) return `${formatter(value)}${suffix}`;
  const rounded = Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded}${suffix}`;
}

/** Y-axis bounds; `"auto"` keeps the data-derived bound on that side. */
export type YDomain = [number | "auto", number | "auto"];

/** Apply a `YDomain` override to a computed `[min, max]` range. */
export function applyYDomain(
  range: [number, number],
  domain: YDomain | undefined,
): [number, number] {
  if (!domain) return range;
  const min = domain[0] === "auto" ? range[0] : domain[0];
  const max = domain[1] === "auto" ? range[1] : domain[1];
  return max > min ? [min, max] : range;
}

/**
 * About `count` ticks at a round step (1 / 2 / 2.5 / 5 × 10^k) inside
 * `[min, max]`. Evenly dividing the range instead produced values like 377.5K
 * whose compact labels ("1.1M" for 1.13M) misplaced the gridline.
 */
export function niceTicks(min: number, max: number, count: number): number[] {
  const n = Math.max(2, Math.round(count));
  const span = max - min;
  if (!(span > 0)) return [min];
  const magnitude = 10 ** Math.floor(Math.log10(span / (n - 1)));
  let best: number[] = [];
  // Of the round steps around the rough step, keep the one whose tick count is closest to n.
  for (const multiple of [0.5, 1, 2, 2.5, 5, 10]) {
    const ticks = ticksAtStep(min, max, multiple * magnitude);
    if (best.length === 0 || Math.abs(ticks.length - n) < Math.abs(best.length - n)) best = ticks;
  }
  return best;
}

function ticksAtStep(min: number, max: number, step: number): number[] {
  const first = Math.ceil(min / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let value = first; value <= max + step * 1e-9; value += step) {
    // Snap float drift (0.30000000000000004 → 0.3).
    ticks.push(Number(value.toPrecision(12)));
  }
  return ticks;
}
