import { useEffect, useState } from "react";

export type ParsedCountUpValue = {
  prefix: string;
  target: number;
  suffix: string;
  decimals: number;
};

export function parseCountUpValue(value: string): ParsedCountUpValue | null {
  const match = value.trim().match(/^([^0-9\-+]*)([-+]?\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return null;

  const [, prefix, numeric, suffix] = match;
  const normalized = numeric.replace(/,/g, "");
  const target = Number(normalized);
  if (!Number.isFinite(target)) return null;

  const decimals = normalized.includes(".") ? (normalized.split(".")[1]?.length ?? 0) : 0;

  return { prefix, target, suffix, decimals };
}

export function formatCountUpValue(
  current: number,
  parsed: ParsedCountUpValue,
): string {
  const rounded =
    parsed.decimals > 0 ? current.toFixed(parsed.decimals) : String(Math.round(current));
  return `${parsed.prefix}${rounded}${parsed.suffix}`;
}

export function usePresentationCountUp(
  value: string,
  enabled: boolean,
  durationMs = 900,
): string {
  const parsed = parseCountUpValue(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!enabled || !parsed) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(formatCountUpValue(parsed.target * eased, parsed));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs, enabled, parsed, value]);

  return display;
}

export function usePresentationNumericCountUp(
  value: number,
  enabled: boolean,
  durationMs = 900,
): number {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!enabled) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(value * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs, enabled, value]);

  return display;
}
