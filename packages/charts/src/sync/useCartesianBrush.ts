import { useCallback, useEffect, useMemo, useState } from "react";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useOptionalChartSync } from "./ChartSyncContext";
import { resolveFollowerBrushRange } from "./brushSync";
import type { BrushRange } from "./brushRange";

export type UseCartesianBrushInput = {
  brush?: boolean;
  brushStart?: number;
  brushEnd?: number;
};

/** Unified cartesian brush sync — leaders publish; followers slice via ChartSyncGroup. */
export function useBrushSync(input: UseCartesianBrushInput) {
  return useCartesianBrush(input);
}

export function useCartesianBrush({
  brush = false,
  brushStart = 0,
  brushEnd = 100,
}: UseCartesianBrushInput) {
  const { syncId, syncFollower } = useChartLayout();
  const sync = useOptionalChartSync();

  const [leaderRange, setLeaderRange] = useState<BrushRange>(() => ({
    start: brushStart,
    end: brushEnd,
  }));

  const followerRange = resolveFollowerBrushRange(sync, syncId, syncFollower);

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
