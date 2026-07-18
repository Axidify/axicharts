"use client";

import type { CSSProperties, ReactElement } from "react";
import { isDarkChartTheme } from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useChartInteraction } from "../interaction/ChartInteractionContext";

export function Crosshair(): ReactElement | null {
  const { cursor } = useChartInteraction();
  const { theme } = useChartLayout();
  const dark = isDarkChartTheme(theme.name);

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
        background: dark
          ? "linear-gradient(180deg, transparent, rgba(148, 163, 184, 0.5), transparent)"
          : "linear-gradient(180deg, transparent, rgba(100, 116, 139, 0.35), transparent)",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
