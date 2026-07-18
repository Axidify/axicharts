import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  __resetLiquidFillExtensionForTests,
  useLiquidFillExtension,
} from "./useLiquidFillExtension";

vi.mock("echarts-liquidfill", () => ({}));

describe("useLiquidFillExtension", () => {
  beforeEach(() => {
    __resetLiquidFillExtensionForTests();
  });

  it("becomes ready after lazy import resolves", async () => {
    const { result } = renderHook(() => useLiquidFillExtension());

    expect(result.current).toBe(false);

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
