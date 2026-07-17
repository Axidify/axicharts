export type BuiltinTickFormat =
  | "number"
  | "currency"
  | "percent"
  | "compact"
  | "bps";

const builtinFormatters: Record<
  BuiltinTickFormat,
  (value: number, locale: string) => string
> = {
  number: (value, locale) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value),
  currency: (value, locale) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value),
  percent: (value, locale) =>
    new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 1,
    }).format(value / 100),
  compact: (value, locale) =>
    new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value),
  bps: (value) => `${value.toFixed(0)} bps`,
};

const customFormatters = new Map<string, (value: number) => string>();

export function registerTickFormat(
  id: string,
  formatter: (value: number) => string,
): void {
  customFormatters.set(id, formatter);
}

export function unregisterTickFormat(id: string): void {
  customFormatters.delete(id);
}

export function clearTickFormats(): void {
  customFormatters.clear();
}

export function formatTick(
  value: number,
  format: BuiltinTickFormat | string = "number",
  locale = "en-US",
): string {
  const custom = customFormatters.get(format);
  if (custom) return custom(value);

  const builtin = builtinFormatters[format as BuiltinTickFormat];
  if (builtin) return builtin(value, locale);

  return builtinFormatters.number(value, locale);
}
