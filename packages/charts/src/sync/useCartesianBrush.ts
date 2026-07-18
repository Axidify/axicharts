import { useCallback, useEffect, useMemo, useState } from "react";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useOptionalChartSync } from "./ChartSyncContext";
import type { BrushRange } from "./brushRange";

export type UseCartesianBrushInput = {
  brush?: boolean;
  brushEnd?: number;
};

export function useCartesianBrush({
  brush = false,
  brushEnd = 100,
}: UseCartesianBrushInput) {
  const { syncId } = useChartLayout();
  const sync = useOptionalChartSync();

  const [leaderRange, setLeaderRange] = useState<BrushRange>(() => ({
    start: 0,
    end: brushEnd,
  }));

  const followerRange =
    sync?.brushRange && sync.brushSourceId !== syncId ? sync.brushRange : null;

  const effectiveRange = useMemo(() => {
    if (brush) {
      return leaderRange;
    }
    return followerRange;
  }, [brush, leaderRange, followerRange]);

  const onBrushRangeChange = useCallback(
    (range: BrushRange) => {
      if (!brush) return;
      setLeaderRange(range);
      if (sync && syncId) {
        sync.publishBrushRange(range, syncId);
      }
    },
    [brush, sync, syncId],
  );

  useEffect(() => {
    if (!brush || !sync || !syncId) return;
    sync.publishBrushRange(leaderRange, syncId);
  }, [brush, sync, syncId, leaderRange]);

  return {
    brush,
    effectiveRange,
    onBrushRangeChange,
  };
}
