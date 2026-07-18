import type { CSSProperties } from "react";

export type LegendVariant = "pill" | "inline" | "compact";
export type TooltipVariant = "card" | "minimal" | "dense";

export const DEFAULT_LEGEND_VARIANT: LegendVariant = "pill";
export const DEFAULT_TOOLTIP_VARIANT: TooltipVariant = "card";

export function legendHeightForVariant(variant: LegendVariant): number {
  switch (variant) {
    case "compact":
      return 22;
    case "inline":
      return 24;
    default:
      return 28;
  }
}

export function legendItemStyle(
  variant: LegendVariant,
  dark: boolean,
): CSSProperties {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: variant === "compact" ? 5 : 6,
    color: dark ? "#cbd5e1" : "#475569",
    fontSize: variant === "compact" ? 10 : 11,
    fontWeight: 500,
  };

  if (variant === "inline") {
    return base;
  }

  return {
    ...base,
    padding: variant === "compact" ? "2px 7px" : "3px 9px",
    borderRadius: 999,
    background: dark ? "rgba(15, 23, 42, 0.55)" : "rgba(241, 245, 249, 0.95)",
    border: dark ? "1px solid rgba(51, 65, 85, 0.8)" : "1px solid #e2e8f0",
  };
}

export function tooltipSurfaceStyle(
  variant: TooltipVariant,
  dark: boolean,
): CSSProperties {
  const shared: CSSProperties = {
    minWidth: variant === "dense" ? 112 : 132,
    maxWidth: variant === "dense" ? 200 : 240,
    borderRadius: variant === "minimal" ? 6 : 10,
    border: dark ? "1px solid rgba(51, 65, 85, 0.9)" : "1px solid rgba(226, 232, 240, 0.95)",
    background: dark ? "rgba(15, 23, 42, 0.92)" : "rgba(255, 255, 255, 0.94)",
    fontSize: variant === "dense" ? 10 : 11,
    color: dark ? "#f8fafc" : "#0f172a",
    pointerEvents: "none",
    zIndex: 3,
  };

  if (variant === "minimal") {
    return {
      ...shared,
      padding: "6px 8px",
      background: dark ? "rgba(15, 23, 42, 0.96)" : "rgba(255, 255, 255, 0.98)",
      boxShadow: dark
        ? "0 4px 12px rgba(0, 0, 0, 0.25)"
        : "0 4px 12px rgba(15, 23, 42, 0.08)",
    };
  }

  if (variant === "dense") {
    return {
      ...shared,
      padding: "6px 10px",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      boxShadow: dark
        ? "0 8px 20px rgba(0, 0, 0, 0.3)"
        : "0 8px 20px rgba(15, 23, 42, 0.08)",
    };
  }

  return {
    ...shared,
    padding: "10px 12px",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: dark
      ? "0 12px 28px rgba(0, 0, 0, 0.35)"
      : "0 10px 28px rgba(15, 23, 42, 0.1)",
  };
}

export function tooltipTitleStyle(dark: boolean): CSSProperties {
  return {
    fontWeight: 600,
    marginBottom: 7,
    color: dark ? "#e2e8f0" : "#334155",
    fontSize: 11,
  };
}

export function tooltipRowsGap(variant: TooltipVariant): number {
  return variant === "dense" ? 3 : 5;
}
