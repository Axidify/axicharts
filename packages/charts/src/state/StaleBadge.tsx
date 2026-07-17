"use client";

import type { ReactElement } from "react";

export function StaleBadge(): ReactElement {
  return (
    <div
      className="axicharts-stale-badge"
      role="status"
      aria-live="polite"
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "#94a3b8",
        background: "rgba(15, 23, 42, 0.72)",
        border: "1px solid #475569",
        zIndex: 3,
        pointerEvents: "none",
      }}
    >
      Stale
    </div>
  );
}
