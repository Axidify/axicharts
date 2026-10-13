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

/** `count` evenly spaced ticks across `[min, max]`, inclusive (count ≥ 2). */
export function evenTicks(min: number, max: number, count: number): number[] {
  const n = Math.max(2, Math.round(count));
  const step = (max - min) / (n - 1);
  return Array.from({ length: n }, (_, index) =>
    index === n - 1 ? max : min + step * index,
  );
}
