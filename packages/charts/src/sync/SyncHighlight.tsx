"use client";

import type { ReactElement } from "react";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useChartInteraction } from "../interaction/ChartInteractionContext";
import { getInteractionChrome } from "../interaction/mode";
import { useOptionalChartSync } from "./ChartSyncContext";

export type SyncHighlightProps = {
  categories: string[];
};

function isDarkSurface(themeName: string): boolean {
  return themeName === "live" || themeName === "industrial";
}

export function SyncHighlight({
  categories,
}: SyncHighlightProps): ReactElement | null {
  const sync = useOptionalChartSync();
  const { syncId, size, theme, mode } = useChartLayout();
  const { cursor } = useChartInteraction();
  const chrome = getInteractionChrome(mode);

  if (!sync || !chrome.showCrosshair || !syncId) return null;
  if (sync.index == null || sync.index < 0) return null;
  if (!cursor || cursor.index !== sync.index || cursor.left < 0) return null;

  const categoryCount = Math.max(categories.length, 1);
  const bandWidth = Math.min(
    48,
    Math.max(20, (size.width / categoryCount) * 0.75),
  );
  const bandLeft = Math.max(0, cursor.left - bandWidth / 2);
  const bandRight = Math.min(size.width, cursor.left + bandWidth / 2);
  const isFollower =
    sync.sourceId != null && sync.sourceId !== syncId;
  const dark = isDarkSurface(theme.name);
  const bandColor = isFollower
    ? dark
      ? "rgba(56, 189, 248, 0.14)"
      : "rgba(59, 130, 246, 0.12)"
    : dark
      ? "rgba(148, 163, 184, 0.1)"
      : "rgba(100, 116, 139, 0.08)";
  const dimColor = dark ? "rgba(2, 6, 23, 0.28)" : "rgba(248, 250, 252, 0.45)";

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {isFollower ? (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: bandLeft,
              background: dimColor,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: bandRight,
              right: 0,
              background: dimColor,
            }}
          />
        </>
      ) : null}
      <div
        className="axicharts-sync-highlight"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: bandLeft,
          width: bandRight - bandLeft,
          background: bandColor,
          borderLeft: isFollower
            ? `1px solid ${dark ? "rgba(56, 189, 248, 0.35)" : "rgba(59, 130, 246, 0.25)"}`
            : undefined,
          borderRight: isFollower
            ? `1px solid ${dark ? "rgba(56, 189, 248, 0.35)" : "rgba(59, 130, 246, 0.25)"}`
            : undefined,
        }}
      />
    </div>
  );
}
