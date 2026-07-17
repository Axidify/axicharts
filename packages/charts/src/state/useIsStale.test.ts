import { describe, expect, it, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsStale } from "./useIsStale";

describe("useIsStale", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false when disabled or inputs are missing", () => {
    const { result } = renderHook(() => useIsStale(undefined, 5000, false));
    expect(result.current).toBe(false);

    const { result: noThreshold } = renderHook(() =>
      useIsStale(Date.now(), undefined, true),
    );
    expect(noThreshold.current).toBe(false);
  });

  it("returns true after staleAfterMs elapses", () => {
    vi.useFakeTimers();
    const updatedAt = Date.now();

    const { result } = renderHook(() => useIsStale(updatedAt, 5000, true));

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(result.current).toBe(true);
  });
});
