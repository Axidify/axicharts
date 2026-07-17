import type uPlot from "uplot";

export function applySyncedCursor(
  plot: uPlot,
  syncIndex: number | null | undefined,
): void {
  const setCursor = plot.setCursor as (cursor: {
    idx?: number;
    left?: number;
    top?: number;
    focus?: boolean;
  }) => void;

  if (syncIndex == null || syncIndex < 0) {
    setCursor({ idx: -1, focus: false });
    return;
  }

  setCursor({ idx: syncIndex, focus: false });
}
