import type { BrushRange } from "./brushRange";
import type { ChartSyncContextValue } from "./ChartSyncContext";

export type { BrushRange };

/**
 * Resolves the brush range a panel should follow from ChartSyncGroup.
 *
 * Semantics:
 * - Leaders (`brush: true`) publish via `publishBrushRange` and do not follow.
 * - Followers mirror the active leader range unless `syncFollower` pins a leader id.
 * - Multiple leaders: last `publishBrushRange` wins (same as cursor `publish`).
 * - Panels never follow their own `syncId`.
 */
export function resolveFollowerBrushRange(
  sync: ChartSyncContextValue | null,
  syncId: string | undefined,
  syncFollower?: string,
): BrushRange | null {
  if (!sync?.brushRange || !syncId) {
    return null;
  }

  if (sync.brushSourceId === syncId) {
    return null;
  }

  if (syncFollower && sync.brushSourceId !== syncFollower) {
    return null;
  }

  return sync.brushRange;
}
