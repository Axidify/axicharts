import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useOptionalChartSync } from "./ChartSyncContext";
import { resolveFollowerBrushRange } from "./brushSync";
import type { BrushRange } from "./brushRange";

export type UseCartesianBrushInput = {
  brush?: boolean;
  brushStart?: number;
  brushEnd?: number;
};

function brushRangesEqual(a: BrushRange, b: BrushRange): boolean {
  return a.start === b.start && a.end === b.end;
}

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
  const syncRef = useRef(sync);
  syncRef.current = sync;

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

  const onBrushRangeChange = useCallback((range: BrushRange) => {
    if (!brush) return;
    setLeaderRange((prev) => (brushRangesEqual(prev, range) ? prev : range));
    const bus = syncRef.current;
    if (bus && syncId) {
      bus.publishBrushRange(range, syncId);
    }
  }, [brush, syncId]);

  useEffect(() => {
    if (!brush || !syncId) return;
    const bus = syncRef.current;
    if (!bus) return;
    bus.publishBrushRange(leaderRange, syncId);
    // Publish the initial leader window once; subsequent updates go through
    // onBrushRangeChange to avoid sync/context feedback loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brush, syncId]);

  return {
    brush,
    effectiveRange,
    onBrushRangeChange,
  };
}
