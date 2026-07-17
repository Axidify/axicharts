import type { CSSProperties, ReactElement } from "react";
import { useOptionalChartLayout } from "../container/useOptionalChartLayout";
import { resolveTagStatTone } from "../alarm/tagTones";

export type StatTone = "neutral" | "success" | "warning" | "critical";

export type StatSurface = "dark" | "light";

const TONE_COLORS: Record<StatSurface, Record<StatTone, string>> = {
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

export type StatProps = {
  value: string;
  label: string;
  tone?: StatTone;
  surface?: StatSurface;
  monospace?: boolean;
  stale?: boolean;
  style?: CSSProperties;
};

export function Stat({
  value,
  label,
  tone = "neutral",
  surface = "dark",
  monospace = false,
  stale = false,
  style,
}: StatProps): ReactElement {
  const layout = useOptionalChartLayout();
  const resolvedTone =
    resolveTagStatTone(layout?.tagTones, label, tone) ?? tone ?? "neutral";
  const colors = TONE_COLORS[surface];
  const labelColor = surface === "light" ? "#64748b" : "#94a3b8";
  const staleColor = surface === "light" ? "#94a3b8" : "#64748b";

  return (
    <div style={style}>
      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
          lineHeight: 1.2,
          color: stale ? staleColor : colors[resolvedTone],
          textDecoration: stale ? "line-through" : undefined,
          fontFamily: monospace
            ? "ui-monospace, SFMono-Regular, Menlo, monospace"
            : undefined,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          color: labelColor,
        }}
      >
        {label}
      </div>
    </div>
  );
}
