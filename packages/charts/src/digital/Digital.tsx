import { useMemo, type CSSProperties, type ReactElement } from "react";
import type { StatSurface, StatTone } from "../stat/Stat";
import { buildSingleValueA11yDescriptor } from "../a11y/singleValueDescriptor";
import { SingleValueChartA11yRoot } from "../a11y/SingleValueChartA11yRoot";
import { useOptionalChartLayout } from "../container/useOptionalChartLayout";

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

export type DigitalProps = {
  value: string | number;
  label?: string;
  unit?: string;
  tone?: StatTone;
  surface?: StatSurface;
  style?: CSSProperties;
};

export function Digital({
  value,
  label,
  unit,
  tone = "neutral",
  surface = "dark",
  style,
}: DigitalProps): ReactElement {
  const layout = useOptionalChartLayout();
  const width = layout?.ready ? layout.size.width : undefined;
  const height = layout?.ready ? layout.size.height : undefined;
  const colors = TONE_COLORS[surface];
  const labelColor = surface === "light" ? "#64748b" : "#94a3b8";
  const display =
    typeof value === "number"
      ? unit
        ? `${value}${unit}`
        : String(value)
      : value;
  const descriptor = useMemo(
    () =>
      buildSingleValueA11yDescriptor({
        title: label ?? "Digital readout",
        value: display,
        description: `Tone: ${tone}`,
      }),
    [display, label, tone],
  );

  const fontSize =
    height !== undefined
      ? Math.min(32, Math.max(18, height * 0.42))
      : 28;

  return (
    <SingleValueChartA11yRoot
      descriptor={descriptor}
      style={{
        width: width ?? "100%",
        height: height ?? "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        ...style,
      }}
    >
      <div
        style={{
          fontSize,
          fontWeight: 600,
          lineHeight: 1.1,
          color: colors[tone],
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          letterSpacing: "-0.02em",
        }}
      >
        {display}
      </div>
      {label ? (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: labelColor,
          }}
        >
          {label}
        </div>
      ) : null}
    </SingleValueChartA11yRoot>
  );
}
