import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import {
  ChartSyncGroup,
  useChartSync,
} from "./ChartSyncContext";

function wrapper({ children }: { children: ReactNode }): ReactElement {
  return <ChartSyncGroup>{children}</ChartSyncGroup>;
}

describe("ChartSyncGroup", () => {
  it("publishes and shares cursor index across hooks", () => {
    const { result } = renderHook(() => useChartSync(), { wrapper });

    act(() => {
      result.current.publish(3, "panel-a");
    });

    expect(result.current.index).toBe(3);
    expect(result.current.sourceId).toBe("panel-a");
  });

  it("clears index when publish receives null", () => {
    const { result } = renderHook(() => useChartSync(), { wrapper });

    act(() => {
      result.current.publish(2, "panel-a");
      result.current.publish(null, "panel-a");
    });

    expect(result.current.index).toBeNull();
    expect(result.current.sourceId).toBe("panel-a");
  });

  it("publishes and shares brush range across hooks", () => {
    const { result } = renderHook(() => useChartSync(), { wrapper });

    act(() => {
      result.current.publishBrushRange({ start: 0, end: 45 }, "ohlc");
    });

    expect(result.current.brushRange).toEqual({ start: 0, end: 45 });
    expect(result.current.brushSourceId).toBe("ohlc");
  });

  it("updates source when another panel publishes", () => {
    const { result } = renderHook(() => useChartSync(), { wrapper });

    act(() => {
      result.current.publish(1, "panel-a");
      result.current.publish(4, "panel-b");
    });

    expect(result.current.index).toBe(4);
    expect(result.current.sourceId).toBe("panel-b");
  });
});
