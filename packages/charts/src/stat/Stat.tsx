import { useMemo, type CSSProperties, type ReactElement } from "react";
import { buildSingleValueA11yDescriptor } from "../a11y/singleValueDescriptor";
import { SingleValueChartA11yRoot } from "../a11y/SingleValueChartA11yRoot";
import { useOptionalChartLayout } from "../container/useOptionalChartLayout";
import { resolveTagStatTone } from "../alarm/tagTones";
import { usePresentationCountUp } from "./usePresentationCountUp";
import { StatDeltaChip } from "./StatDeltaChip";
import type { StatDeltaDirection } from "./statDelta";

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
  unit?: string;
  delta?: string;
  deltaDirection?: StatDeltaDirection;
  tone?: StatTone;
  surface?: StatSurface;
  monospace?: boolean;
  stale?: boolean;
  style?: CSSProperties;
};

export function Stat({
  value,
  label,
  unit,
  delta,
  deltaDirection,
  tone = "neutral",
  surface = "dark",
  monospace = false,
  stale = false,
  style,
}: StatProps): ReactElement {
  const layout = useOptionalChartLayout();
  const animatedValue = usePresentationCountUp(
    value,
    layout?.mode === "presentation",
  );
  const plotHeight = layout?.size.height ?? 0;
  const plotWidth = layout?.size.width ?? 0;
  const compactKpi = plotHeight > 0 && plotHeight < 96;
  const narrowKpi = compactKpi && plotWidth > 0 && plotWidth < 120;
  const mediumKpi = plotHeight >= 96 && plotHeight < 140;
  const resolvedTone =
    resolveTagStatTone(layout?.tagTones, label, tone) ?? tone ?? "neutral";
  const colors = TONE_COLORS[surface];
  const labelColor = surface === "light" ? "#64748b" : "#94a3b8";
  const staleColor = surface === "light" ? "#94a3b8" : "#64748b";
  const hero = layout?.mode === "presentation";
  const valueFontSize = hero
    ? 28
    : compactKpi
      ? Math.min(
          18,
          Math.max(
            13,
            Math.min(plotHeight * 0.38, narrowKpi ? plotWidth * 0.19 : 18),
          ),
        )
      : mediumKpi
        ? 22
        : 20;
  const unitFontSize = compactKpi ? (narrowKpi ? 9 : 10) : hero ? 14 : 12;
  const labelFontSize = compactKpi ? 10 : 12;
  const descriptor = useMemo(
    () =>
      buildSingleValueA11yDescriptor({
        title: label,
        value: animatedValue,
        description: [
          unit ? `Unit: ${unit}` : null,
          delta ? `Change: ${delta}` : null,
          `Tone: ${resolvedTone}`,
          stale ? "Stale" : null,
        ]
          .filter(Boolean)
          .join("; "),
      }),
    [animatedValue, delta, label, resolvedTone, stale, unit],
  );

  return (
    <SingleValueChartA11yRoot
      descriptor={descriptor}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: plotHeight > 0 ? "center" : undefined,
        height: plotHeight > 0 ? "100%" : undefined,
        minHeight: 0,
        padding: compactKpi ? "10px 12px" : mediumKpi ? "12px 14px" : undefined,
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: narrowKpi ? 4 : 8,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 3,
            minWidth: 0,
            flex: "1 1 auto",
          }}
        >
          <div
            style={{
              fontSize: valueFontSize,
              fontWeight: 600,
              lineHeight: 1.15,
              color: stale ? staleColor : colors[resolvedTone],
              textDecoration: stale ? "line-through" : undefined,
              fontFamily: monospace
                ? "ui-monospace, SFMono-Regular, Menlo, monospace"
                : undefined,
            fontVariantNumeric: monospace ? "tabular-nums" : undefined,
            whiteSpace: narrowKpi ? "nowrap" : "nowrap",
            overflow: narrowKpi ? "visible" : "hidden",
            textOverflow: narrowKpi ? undefined : "ellipsis",
            flexShrink: narrowKpi ? 0 : 1,
            }}
          >
            {animatedValue}
          </div>
          {unit ? (
            <span
              style={{
                fontSize: unitFontSize,
                fontWeight: 500,
                lineHeight: 1.2,
                color: labelColor,
                flexShrink: 0,
              }}
            >
              {unit}
            </span>
          ) : null}
        </div>
        {delta ? (
          <StatDeltaChip
            delta={delta}
            direction={deltaDirection}
            surface={surface}
            compact={compactKpi || narrowKpi}
          />
        ) : null}
      </div>
      <div
        style={{
          marginTop: compactKpi ? 2 : 4,
          fontSize: labelFontSize,
          lineHeight: 1.25,
          color: labelColor,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </SingleValueChartA11yRoot>
  );
}
