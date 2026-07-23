"use client";

import type { ReactElement } from "react";
import { resolveHoverChrome } from "@axicharts/charts-theme";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useChartInteraction } from "../interaction/ChartInteractionContext";
import { getInteractionChrome } from "../interaction/mode";
import { useOptionalChartSync } from "./ChartSyncContext";

export type SyncHighlightProps = {
  categories: string[];
};

export function categoryBandGeometry(
  width: number,
  categoryCount: number,
  cursorLeft: number,
): { bandLeft: number; bandRight: number } {
  const count = Math.max(categoryCount, 1);
  const bandWidth = Math.min(48, Math.max(20, (width / count) * 0.75));
  const bandLeft = Math.max(0, cursorLeft - bandWidth / 2);
  const bandRight = Math.min(width, cursorLeft + bandWidth / 2);
  return { bandLeft, bandRight };
}

export function SyncHighlight({
  categories,
}: SyncHighlightProps): ReactElement | null {
  const sync = useOptionalChartSync();
  const { syncId, size, theme, mode } = useChartLayout();
  const { cursor } = useChartInteraction();
  const chrome = getInteractionChrome(mode);

  if (!chrome.showCrosshair) return null;
  if (!cursor || cursor.index < 0 || cursor.left < 0) return null;

  const hover = resolveHoverChrome(theme);
  const { bandLeft, bandRight } = categoryBandGeometry(
    size.width,
    categories.length,
    cursor.left,
  );
  const isFollower =
    sync != null &&
    syncId != null &&
    sync.sourceId != null &&
    sync.sourceId !== syncId &&
    sync.index != null &&
    sync.index >= 0 &&
    cursor.index === sync.index;
  const bandColor = isFollower ? hover.bandFollowerColor : hover.bandColor;

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
              background: hover.dimOverlay,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: bandRight,
              right: 0,
              background: hover.dimOverlay,
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
            ? `1px solid ${hover.bandFollowerBorder}`
            : undefined,
          borderRight: isFollower
            ? `1px solid ${hover.bandFollowerBorder}`
            : undefined,
        }}
      />
    </div>
  );
}
