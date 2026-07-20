import { describe, expect, it } from "vitest";
import { useChromeInsets } from "./useChromeInsets";
import { renderHook, act } from "@testing-library/react";

describe("useChromeInsets", () => {
  it("sums registered inset heights", () => {
    const { result } = renderHook(() => useChromeInsets());

    act(() => {
      result.current.register("legend", 28);
    });

    expect(result.current.total).toBe(28);

    act(() => {
      result.current.register("legend", 0);
    });

    expect(result.current.total).toBe(0);
  });
});
