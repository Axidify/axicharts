"use client";

import type { ReactElement } from "react";
import { useChartInteraction } from "../interaction/ChartInteractionContext";

export function Crosshair(): ReactElement | null {
  const { cursor } = useChartInteraction();

  if (!cursor || cursor.index < 0) return null;

  return (
    <div
      className="axicharts-crosshair"
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: cursor.left,
        width: 1,
        background: "rgba(100, 116, 139, 0.55)",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
