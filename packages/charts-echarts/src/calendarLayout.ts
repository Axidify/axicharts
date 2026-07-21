import { isCompactTile } from "./themeBridge";

export type CalendarHeatmapLayout = {
  compact: boolean;
  showCellLabels: boolean;
  cellSize: number | [number | "auto", number | "auto"];
  inset: { top: number; left: number; right: number; bottom: number };
};

export function resolveCalendarHeatmapLayout(
  width: number,
  height: number,
  options?: { showLabels?: boolean },
): CalendarHeatmapLayout {
  const compact = isCompactTile(width, height);
  const cell = compact
    ? Math.max(6, Math.min(10, Math.floor(width / 62)))
    : Math.max(8, Math.min(14, Math.floor(width / 60)));

  return {
    compact,
    showCellLabels: Boolean(options?.showLabels) && !compact,
    cellSize: ["auto", cell] as [number | "auto", number],
    inset: compact
      ? { top: 28, left: 28, right: 8, bottom: 32 }
      : { top: 48, left: 40, right: 20, bottom: 40 },
  };
}
