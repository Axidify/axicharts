import { useCallback } from "react";
import type { PlotCursorEvent } from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useChartInteraction } from "../interaction/ChartInteractionContext";
import { useOptionalChartSync } from "../sync/ChartSyncContext";

export type PlotSyncProps = {
  onCursor: (event: PlotCursorEvent) => void;
  onSyncIndex: (index: number | null) => void;
  syncIndex: number | null;
  syncSourceId: string | null;
  chartId?: string;
};

export function usePlotSync(): PlotSyncProps {
  const { syncId } = useChartLayout();
  const sync = useOptionalChartSync();
  const { setCursor } = useChartInteraction();

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
    syncIndex: sync?.index ?? null,
    syncSourceId: sync?.sourceId ?? null,
    chartId: syncId,
  };
}
