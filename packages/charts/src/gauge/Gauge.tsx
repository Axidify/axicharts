import { useMemo, type ReactElement } from "react";
import type { StatTone } from "../stat/Stat";
import { buildSingleValueA11yDescriptor } from "../a11y/singleValueDescriptor";
import { SingleValueChartA11yRoot } from "../a11y/SingleValueChartA11yRoot";
import { useOptionalChartLayout } from "../container/useOptionalChartLayout";
import { resolveTagStatTone } from "../alarm/tagTones";

const TONE_STROKE: Record<StatTone, string> = {
  neutral: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
};

export type GaugeProps = {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  tone?: StatTone;
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
  warningAt,
  criticalAt,
}: GaugeProps): ReactElement {
  const layout = useOptionalChartLayout();
  const resolvedTone =
    tone ??
    resolveTagStatTone(layout?.tagTones, label) ??
    resolveTone(value, undefined, warningAt, criticalAt);
  const width = layout?.ready ? layout.size.width : 160;
  const height = layout?.ready ? layout.size.height : 120;

  const cx = width / 2;
  const cy = height * 0.82;
  const r = Math.min(width, height * 1.2) * 0.36;
  const start = Math.PI;
  const end = 0;
  const span = max - min || 1;
  const clamped = Math.min(max, Math.max(min, value));
  const fraction = (clamped - min) / span;
  const valueEnd = start - fraction * Math.PI;
  const stroke = TONE_STROKE[resolvedTone];
  const track = "#334155";
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
          strokeWidth={10}
          strokeLinecap="round"
        />
        <path
          d={arcPath(cx, cy, r, start, valueEnd)}
          fill="none"
          stroke={stroke}
          strokeWidth={10}
          strokeLinecap="round"
        />
        <text
          x={cx}
          y={cy - r * 0.15}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize={Math.max(14, width * 0.14)}
          fontWeight={600}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          {display}
        </text>
        {label ? (
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={11}
          >
            {label}
          </text>
        ) : null}
        <text x={cx - r} y={cy + 14} textAnchor="middle" fill="#64748b" fontSize={9}>
          {min}
        </text>
        <text x={cx + r} y={cy + 14} textAnchor="middle" fill="#64748b" fontSize={9}>
          {max}
        </text>
      </svg>
    </SingleValueChartA11yRoot>
  );
}
