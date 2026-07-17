import type { ReactElement } from "react";

export type TankTone = "neutral" | "success" | "warning" | "critical";

const FILL: Record<TankTone, string> = {
  neutral: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
};

export type TankChartProps = {
  level: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  width?: number;
  height?: number;
  tone?: TankTone;
  warningAt?: number;
  criticalAt?: number;
};

function resolveTone(
  level: number,
  tone: TankTone | undefined,
  warningAt?: number,
  criticalAt?: number,
): TankTone {
  if (tone) return tone;
  if (criticalAt !== undefined && level >= criticalAt) return "critical";
  if (warningAt !== undefined && level >= warningAt) return "warning";
  return "neutral";
}

export function TankChart({
  level,
  min = 0,
  max = 100,
  label,
  unit = "%",
  width = 120,
  height = 180,
  tone,
  warningAt,
  criticalAt,
}: TankChartProps): ReactElement {
  const span = max - min || 1;
  const clamped = Math.min(max, Math.max(min, level));
  const fraction = (clamped - min) / span;
  const fillTone = resolveTone(clamped, tone, warningAt, criticalAt);
  const pad = 12;
  const tankX = pad;
  const tankY = pad;
  const tankW = width - pad * 2;
  const tankH = height - pad * 2 - (label ? 18 : 0);
  const fillH = tankH * fraction;
  const display =
    unit === "%" ? `${clamped.toFixed(0)}%` : `${clamped.toFixed(1)}${unit}`;

  const levelLine = (value: number, color: string) => {
    const y = tankY + tankH - ((value - min) / span) * tankH;
    return (
      <line
        key={value}
        x1={tankX}
        x2={tankX + tankW}
        y1={y}
        y2={y}
        stroke={color}
        strokeWidth={1}
        strokeDasharray="4 3"
      />
    );
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label ? `${label}: ${display}` : display}
    >
      <rect
        x={tankX}
        y={tankY}
        width={tankW}
        height={tankH}
        rx={8}
        fill="#1e293b"
        stroke="#475569"
        strokeWidth={1.5}
      />
      <rect
        x={tankX + 2}
        y={tankY + tankH - fillH + 2}
        width={tankW - 4}
        height={Math.max(0, fillH - 4)}
        rx={6}
        fill={FILL[fillTone]}
        opacity={0.9}
      />
      {warningAt !== undefined ? levelLine(warningAt, "#f59e0b") : null}
      {criticalAt !== undefined ? levelLine(criticalAt, "#ef4444") : null}
      <text
        x={width / 2}
        y={tankY + tankH / 2}
        textAnchor="middle"
        fill="#e2e8f0"
        fontSize={14}
        fontWeight={600}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        {display}
      </text>
      {label ? (
        <text
          x={width / 2}
          y={height - 4}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={11}
        >
          {label}
        </text>
      ) : null}
    </svg>
  );
}
