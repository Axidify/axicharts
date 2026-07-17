import type { CSSProperties, ReactElement } from "react";

export type StatTone = "neutral" | "success" | "warning" | "critical";

const TONE_COLORS: Record<StatTone, string> = {
  neutral: "#e2e8f0",
  success: "#4ade80",
  warning: "#fbbf24",
  critical: "#f87171",
};

export type StatProps = {
  value: string;
  label: string;
  tone?: StatTone;
  monospace?: boolean;
  style?: CSSProperties;
};

export function Stat({
  value,
  label,
  tone = "neutral",
  monospace = false,
  style,
}: StatProps): ReactElement {
  return (
    <div style={style}>
      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
          lineHeight: 1.2,
          color: TONE_COLORS[tone],
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
          color: "#94a3b8",
        }}
      >
        {label}
      </div>
    </div>
  );
}
