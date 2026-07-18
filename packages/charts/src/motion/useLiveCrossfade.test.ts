import { describe, expect, it, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useLiveCrossfade } from "./useLiveCrossfade";

describe("useLiveCrossfade", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not crossfade when disabled", () => {
    const { result, rerender } = renderHook(
      ({ signature }) =>
        useLiveCrossfade({
          enabled: false,
          structureSignature: signature,
          mode: "live",
        }),
      { initialProps: { signature: "a::1:Revenue" } },
    );

    rerender({ signature: "b::2:Revenue|Cost" });
    expect(result.current.crossfadeTick).toBe(0);
    expect(result.current.plotStyle).toBeUndefined();
  });

  it("does not crossfade outside live mode", () => {
    const { result, rerender } = renderHook(
      ({ signature }) =>
        useLiveCrossfade({
          enabled: true,
          structureSignature: signature,
          mode: "interactive",
        }),
      { initialProps: { signature: "a::1:Revenue" } },
    );

    rerender({ signature: "b::2:Revenue|Cost" });
    expect(result.current.crossfadeTick).toBe(0);
    expect(result.current.plotStyle).toBeUndefined();
  });

  it("crossfades on structure change after mount in live mode", () => {
    const { result, rerender } = renderHook(
      ({ signature }) =>
        useLiveCrossfade({
          enabled: true,
          structureSignature: signature,
          mode: "live",
        }),
      { initialProps: { signature: "3:Q1,Q2,Q3::2:Revenue|Cost" } },
    );

    expect(result.current.crossfadeTick).toBe(0);

    act(() => {
      rerender({ signature: "4:Q1,Q2,Q3,Q4::2:Revenue|Cost" });
    });

    expect(result.current.crossfadeTick).toBe(1);
    expect(result.current.plotStyle).toMatchObject({
      animation: expect.stringContaining("axicharts-live-crossfade"),
    });
  });

  it("does not crossfade when structure signature is unchanged", () => {
    const signature = "3:Q1,Q2,Q3::2:Revenue|Cost";
    const { result, rerender } = renderHook(
      () =>
        useLiveCrossfade({
          enabled: true,
          structureSignature: signature,
          mode: "live",
        }),
    );

    act(() => {
      rerender();
    });

    expect(result.current.crossfadeTick).toBe(0);
  });

  it("skips crossfade when prefers-reduced-motion is set", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result, rerender } = renderHook(
      ({ signature }) =>
        useLiveCrossfade({
          enabled: true,
          structureSignature: signature,
          mode: "live",
        }),
      { initialProps: { signature: "3:Q1,Q2,Q3::1:Revenue" } },
    );

    act(() => {
      rerender({ signature: "4:Q1,Q2,Q3,Q4::1:Revenue" });
    });

    expect(result.current.crossfadeTick).toBe(0);
    expect(result.current.plotStyle).toBeUndefined();
  });
});
