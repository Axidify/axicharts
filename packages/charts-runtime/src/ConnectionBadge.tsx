"use client";

import type { ReactElement } from "react";
import type { ConnectionState } from "./types";

const BADGE_STYLES: Record<
  ConnectionState,
  { color: string; background: string; border: string; label: string }
> = {
  idle: {
    color: "#94a3b8",
    background: "rgba(15, 23, 42, 0.72)",
    border: "#475569",
    label: "Idle",
  },
  connecting: {
    color: "#fde68a",
    background: "rgba(120, 53, 15, 0.82)",
    border: "#f59e0b",
    label: "Connecting",
  },
  ready: {
    color: "#bbf7d0",
    background: "rgba(20, 83, 45, 0.82)",
    border: "#22c55e",
    label: "Live",
  },
  stale: {
    color: "#fed7aa",
    background: "rgba(124, 45, 18, 0.82)",
    border: "#f97316",
    label: "Stale",
  },
  error: {
    color: "#fecaca",
    background: "rgba(127, 29, 29, 0.82)",
    border: "#ef4444",
    label: "Error",
  },
};

export type ConnectionBadgeProps = {
  connection: ConnectionState;
  compact?: boolean;
};

export function ConnectionBadge({
  connection,
  compact = false,
}: ConnectionBadgeProps): ReactElement {
  const style = BADGE_STYLES[connection];

  return (
    <span
      className="axicharts-connection-badge"
      role="status"
      aria-live="polite"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 4 : 6,
        padding: compact ? "2px 6px" : "2px 8px",
        borderRadius: 999,
        fontSize: compact ? 10 : 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: style.color,
        background: style.background,
        border: `1px solid ${style.border}`,
        pointerEvents: "none",
      }}
    >
      <span
        aria-hidden
        style={{
          width: compact ? 6 : 7,
          height: compact ? 6 : 7,
          borderRadius: "50%",
          background: style.border,
        }}
      />
      {style.label}
    </span>
  );
}
