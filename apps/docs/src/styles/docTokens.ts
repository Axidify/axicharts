import type { CSSProperties } from "react";

/** Shared visual tokens for the axicharts docs site. */
export const docColors = {
  bg: "#f8fafc",
  surface: "#ffffff",
  text: "#0f172a",
  muted: "#475569",
  subtle: "#64748b",
  border: "#e2e8f0",
  accent: "#2563eb",
  accentSoft: "#eff6ff",
} as const;

export const docShadow = {
  card: "0 8px 24px rgba(15, 23, 42, 0.06)",
  header: "0 1px 0 rgba(15, 23, 42, 0.04)",
} as const;

export const docRadii = {
  sm: 6,
  md: 8,
  lg: 10,
  pill: 999,
} as const;

export function docCardStyle(): CSSProperties {
  return {
    border: `1px solid ${docColors.border}`,
    borderRadius: docRadii.lg,
    background: docColors.surface,
    boxShadow: docShadow.card,
  };
}

export function docSectionTitleStyle(): CSSProperties {
  return {
    fontSize: 16,
    fontWeight: 600,
    color: docColors.text,
    marginTop: 28,
    marginBottom: 8,
  };
}

export function docBodyStyle(): CSSProperties {
  return {
    color: docColors.muted,
    maxWidth: 640,
    lineHeight: 1.6,
    fontSize: 14,
  };
}
