import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { ChartSyncGroup } from "./ChartSyncContext";
import { useCartesianBrush } from "./useCartesianBrush";

vi.mock("../container/ChartLayoutContext", () => ({
  useChartLayout: () => ({ syncId: "leader" }),
}));

function wrapper({ children }: { children: ReactNode }): ReactElement {
  return <ChartSyncGroup>{children}</ChartSyncGroup>;
}

describe("useCartesianBrush", () => {
  it("tracks leader brush range and publishes to sync bus", () => {
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
});
