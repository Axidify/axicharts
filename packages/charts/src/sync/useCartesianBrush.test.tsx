import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { ChartSyncGroup, useChartSync } from "./ChartSyncContext";
import { useCartesianBrush } from "./useCartesianBrush";

const layoutState = vi.hoisted(() => ({
  syncId: "leader" as string,
  syncFollower: undefined as string | undefined,
}));

vi.mock("../container/ChartLayoutContext", () => ({
  useChartLayout: () => ({
    syncId: layoutState.syncId,
    syncFollower: layoutState.syncFollower,
  }),
}));

function wrapper({ children }: { children: ReactNode }): ReactElement {
  return <ChartSyncGroup>{children}</ChartSyncGroup>;
}

describe("useCartesianBrush", () => {
  it("tracks leader brush range and publishes to sync bus", () => {
    layoutState.syncId = "leader";
    layoutState.syncFollower = undefined;

    const { result } = renderHook(
      () => useCartesianBrush({ brush: true, brushEnd: 45 }),
      { wrapper },
    );

    expect(result.current.effectiveRange).toEqual({ start: 0, end: 45 });

    act(() => {
      result.current.onBrushRangeChange({ start: 10, end: 60 });
    });

    expect(result.current.effectiveRange).toEqual({ start: 10, end: 60 });
  });

  it("follows pinned leader range on followers", () => {
    layoutState.syncId = "errors";
    layoutState.syncFollower = "throughput";

    const { result } = renderHook(
      () => ({
        bus: useChartSync(),
        brush: useCartesianBrush({ brush: false }),
      }),
      { wrapper },
    );

    act(() => {
      result.current.bus.publishBrushRange({ start: 0, end: 30 }, "ohlc");
    });
    expect(result.current.brush.effectiveRange).toBeNull();

    act(() => {
      result.current.bus.publishBrushRange({ start: 15, end: 65 }, "throughput");
    });
    expect(result.current.brush.effectiveRange).toEqual({
      start: 15,
      end: 65,
    });
  });

  it("does not republish when follower receives the same normalized range", () => {
    layoutState.syncId = "leader";
    layoutState.syncFollower = undefined;

    const publishSpy = vi.fn();
    const { result } = renderHook(
      () => ({
        bus: useChartSync(),
        brush: useCartesianBrush({ brush: true, brushEnd: 100 }),
      }),
      { wrapper },
    );

    const originalPublish = result.current.bus.publishBrushRange;
    result.current.bus.publishBrushRange = (...args) => {
      publishSpy(...args);
      originalPublish(...args);
    };

    act(() => {
      result.current.brush.onBrushRangeChange({ start: 10, end: 60 });
      result.current.brush.onBrushRangeChange({ start: 10, end: 60 });
    });

    expect(publishSpy).toHaveBeenCalledTimes(2);
    expect(result.current.brush.effectiveRange).toEqual({ start: 10, end: 60 });
  });
});
