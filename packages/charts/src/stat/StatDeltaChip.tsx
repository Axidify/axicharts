import type { ReactElement } from "react";
import type { StatSurface } from "./Stat";
import {
  inferStatDeltaDirection,
  statDeltaChipStyle,
  type StatDeltaDirection,
} from "./statDelta";

export type StatDeltaChipProps = {
  delta: string;
  direction?: StatDeltaDirection;
  surface?: StatSurface;
  compact?: boolean;
};

export function StatDeltaChip({
  delta,
  direction,
  surface = "light",
  compact = false,
}: StatDeltaChipProps): ReactElement {
  const resolved = direction ?? inferStatDeltaDirection(delta);
  const chip = statDeltaChipStyle(resolved, surface);

  return (
    <span
      className="axicharts-stat-delta"
      style={{
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
        fontSize: compact ? 9 : 10,
        fontWeight: 600,
        lineHeight: 1.2,
        padding: compact ? "2px 6px" : "3px 8px",
        borderRadius: 999,
        background: chip.background,
        color: chip.color,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        whiteSpace: "nowrap",
      }}
    >
      {delta}
    </span>
  );
}
