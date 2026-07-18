import { useCallback } from "react";
import type { PlotCursorEvent } from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useChartInteraction } from "../interaction/ChartInteractionContext";
import { useOptionalChartSync } from "../sync/ChartSyncContext";
import { resolveFollowerBrushRange } from "./brushSync";
import { mapSyncIndexForBrushRange } from "./brushRange";

export type PlotSyncProps = {
  onCursor: (event: PlotCursorEvent) => void;
  onSyncIndex: (index: number | null) => void;
  syncIndex: number | null;
  syncSourceId: string | null;
  chartId?: string;
};

export function usePlotSync(categoryCount = 0): PlotSyncProps {
  const { syncId, syncFollower } = useChartLayout();
  const sync = useOptionalChartSync();
  const { setCursor } = useChartInteraction();

  const followerBrushRange = resolveFollowerBrushRange(sync, syncId, syncFollower);

  const onSyncIndex = useCallback(
    (index: number | null) => {
      if (sync && syncId) {
        sync.publish(index, syncId);
      }
    },
    [sync, syncId],
  );

  const onCursor = useCallback(
    (event: PlotCursorEvent) => {
      setCursor(event);
    },
    [setCursor],
  );

  return {
    onCursor,
    onSyncIndex,
    syncIndex: mapSyncIndexForBrushRange(
      sync?.index ?? null,
      followerBrushRange,
      categoryCount,
    ),
    syncSourceId: sync?.sourceId ?? null,
    chartId: syncId,
  };
}
