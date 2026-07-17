import { useCallback } from "react";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useOptionalChartSync } from "./ChartSyncContext";

export function useEChartsSync() {
  const { syncId } = useChartLayout();
  const sync = useOptionalChartSync();

  const onSyncIndex = useCallback(
    (index: number | null) => {
      if (sync && syncId) {
        sync.publish(index, syncId);
      }
    },
    [sync, syncId],
  );

  return {
    onSyncIndex,
    syncIndex: sync?.index ?? null,
    syncSourceId: sync?.sourceId ?? null,
    chartId: syncId,
  };
}
