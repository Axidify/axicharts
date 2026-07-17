"use client";

import type { ReactElement } from "react";
import type { ChartDataState } from "./types";

const MESSAGES: Record<Exclude<ChartDataState, "ready">, string> = {
  loading: "Loading chart data…",
  empty: "No data to display",
  error: "Unable to load chart",
};

export type ChartStateOverlayProps = {
  state: Exclude<ChartDataState, "ready">;
  message?: string;
  dark?: boolean;
};

export function ChartStateOverlay({
  state,
  message,
  dark = false,
}: ChartStateOverlayProps): ReactElement {
  const label = message ?? MESSAGES[state];

  return (
    <div
      className="axicharts-state-overlay"
      role={state === "loading" ? "status" : "alert"}
      aria-live="polite"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: dark
          ? state === "loading"
            ? "rgba(15, 23, 42, 0.72)"
            : "rgba(15, 23, 42, 0.9)"
          : state === "loading"
            ? "rgba(255, 255, 255, 0.72)"
            : "rgba(248, 250, 252, 0.92)",
        color: state === "error" ? (dark ? "#fca5a5" : "#b91c1c") : dark ? "#cbd5e1" : "#475569",
        fontSize: 12,
        fontWeight: 500,
        textAlign: "center",
        zIndex: 4,
        pointerEvents: "none",
      }}
    >
      {state === "loading" ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span
            aria-hidden
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "2px solid #cbd5e1",
              borderTopColor: "#3b82f6",
              animation: "axicharts-spin 0.8s linear infinite",
            }}
          />
          {label}
        </span>
      ) : (
        label
      )}
    </div>
  );
}
