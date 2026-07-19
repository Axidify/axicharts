import { useMemo, type ReactElement } from "react";
import type { StatTone, StatSurface } from "../stat/Stat";
import { buildSingleValueA11yDescriptor } from "../a11y/singleValueDescriptor";
import { SingleValueChartA11yRoot } from "../a11y/SingleValueChartA11yRoot";
import { useOptionalChartLayout } from "../container/useOptionalChartLayout";
import { resolveTagStatTone } from "../alarm/tagTones";
import { usePresentationNumericCountUp } from "../stat/usePresentationCountUp";

const TONE_VALUE: Record<StatSurface, Record<StatTone, string>> = {
  dark: {
    neutral: "#e2e8f0",
    success: "#4ade80",
    warning: "#fbbf24",
    critical: "#f87171",
  },
  light: {
    neutral: "#0f172a",
    success: "#16a34a",
    warning: "#d97706",
    critical: "#dc2626",
  },
};

export type GaugeProps = {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  tone?: StatTone;
  /** Text/track palette — defaults to light in presentation mode. */
  surface?: StatSurface;
  warningAt?: number;
  criticalAt?: number;
};

function polar(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number,
): string {
  const s = polar(cx, cy, r, start);
  const e = polar(cx, cy, r, end);
  const large = end - start <= Math.PI ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

function resolveTone(
  value: number,
  tone: StatTone | undefined,
  warningAt?: number,
  criticalAt?: number,
): StatTone {
  if (tone) return tone;
  if (criticalAt !== undefined && value >= criticalAt) return "critical";
  if (warningAt !== undefined && value >= warningAt) return "warning";
  return "neutral";
}

export function Gauge({
  value,
  min = 0,
  max = 100,
  label,
  unit = "",
  tone,
  surface: surfaceProp,
  warningAt,
  criticalAt,
}: GaugeProps): ReactElement {
  const layout = useOptionalChartLayout();
  const presentation = layout?.mode === "presentation";
  const surface: StatSurface =
    surfaceProp ?? (presentation ? "light" : "dark");
  const animatedValue = usePresentationNumericCountUp(value, presentation);
  const resolvedTone =
    tone ??
    resolveTagStatTone(layout?.tagTones, label) ??
    resolveTone(value, undefined, warningAt, criticalAt);
  const width = layout?.ready ? layout.size.width : 160;
  const height = layout?.ready ? layout.size.height : 120;

  const cx = width / 2;
  const cy = height * 0.86;
  const r = Math.min(width, height * 1.1) * 0.33;
  const strokeWidth = Math.max(7, Math.min(11, r * 0.13));
  const start = Math.PI;
  const end = 0;
  const span = max - min || 1;
  const clamped = Math.min(max, Math.max(min, animatedValue));
  const fraction = (clamped - min) / span;
  const valueEnd = start - fraction * Math.PI;
  const stroke = TONE_VALUE[surface][resolvedTone];
  const track = surface === "light" ? "#e2e8f0" : "#334155";
  const labelColor = surface === "light" ? "#64748b" : "#94a3b8";
  const tickColor = surface === "light" ? "#94a3b8" : "#64748b";
  const valueFontSize = Math.min(Math.max(13, width * 0.095), r * 0.34);
  const valueY = cy - r * 0.24;
  const labelY = valueY + valueFontSize * 0.72;
  const display =
    unit === "%" ? `${clamped.toFixed(0)}%` : `${clamped.toFixed(0)}${unit}`;
  const descriptor = useMemo(
    () =>
      buildSingleValueA11yDescriptor({
        title: label ?? "Gauge",
        value: display,
        description: [
          `Range ${min}–${max}`,
          `Tone: ${resolvedTone}`,
          warningAt != null ? `Warning at ${warningAt}` : null,
          criticalAt != null ? `Critical at ${criticalAt}` : null,
        ]
          .filter(Boolean)
          .join("; "),
      }),
    [criticalAt, display, label, max, min, resolvedTone, warningAt],
  );

  return (
    <SingleValueChartA11yRoot descriptor={descriptor}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        <path
          d={arcPath(cx, cy, r, start, end)}
          fill="none"
          stroke={track}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={arcPath(cx, cy, r, start, valueEnd)}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <text
          x={cx}
          y={valueY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={stroke}
          fontSize={valueFontSize}
          fontWeight={600}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          {display}
        </text>
        {label ? (
          <text
            x={cx}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="hanging"
            fill={labelColor}
            fontSize={Math.max(11, valueFontSize * 0.32)}
          >
            {label}
          </text>
        ) : null}
        <text x={cx - r} y={cy + 12} textAnchor="middle" fill={tickColor} fontSize={9}>
          {min}
        </text>
        <text x={cx + r} y={cy + 12} textAnchor="middle" fill={tickColor} fontSize={9}>
          {max}
        </text>
      </svg>
    </SingleValueChartA11yRoot>
  );
}
