import { useCallback } from "react";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useOptionalChartSync } from "./ChartSyncContext";
import { resolveFollowerBrushRange } from "./brushSync";
import type { BrushRange } from "./brushRange";

export function useEChartsSync() {
  const { syncId, syncFollower } = useChartLayout();
  const sync = useOptionalChartSync();

  const onSyncIndex = useCallback(
    (index: number | null) => {
      if (sync && syncId) {
        sync.publish(index, syncId);
      }
    },
    [sync, syncId],
  );

  const onBrushRange = useCallback(
    (range: BrushRange | null) => {
      if (sync && syncId) {
        sync.publishBrushRange(range, syncId);
      }
    },
    [sync, syncId],
  );

  const followerBrushRange = resolveFollowerBrushRange(sync, syncId, syncFollower);

  return {
    onSyncIndex,
    onBrushRange,
    syncIndex: sync?.index ?? null,
    syncSourceId: sync?.sourceId ?? null,
    followerBrushRange,
    chartId: syncId,
  };
}
