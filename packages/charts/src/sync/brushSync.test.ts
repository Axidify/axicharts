import { describe, expect, it } from "vitest";
import { resolveFollowerBrushRange } from "./brushSync";
import type { ChartSyncContextValue } from "./ChartSyncContext";

function syncState(
  overrides: Partial<ChartSyncContextValue> = {},
): ChartSyncContextValue {
  return {
    index: null,
    sourceId: null,
    brushRange: null,
    brushSourceId: null,
    publish: () => {},
    publishBrushRange: () => {},
    ...overrides,
  };
}

describe("resolveFollowerBrushRange", () => {
  const range = { start: 10, end: 55 };

  it("returns null when sync bus is missing", () => {
    expect(resolveFollowerBrushRange(null, "rsi")).toBeNull();
  });

  it("returns null when brush range is unset", () => {
    expect(resolveFollowerBrushRange(syncState(), "rsi")).toBeNull();
  });

  it("returns null when panel is the brush source", () => {
    expect(
      resolveFollowerBrushRange(
        syncState({ brushRange: range, brushSourceId: "ohlc" }),
        "ohlc",
      ),
    ).toBeNull();
  });

  it("follows any leader when syncFollower is omitted", () => {
    expect(
      resolveFollowerBrushRange(
        syncState({ brushRange: range, brushSourceId: "throughput" }),
        "errors",
      ),
    ).toEqual(range);
  });

  it("follows only the pinned leader when syncFollower is set", () => {
    const sync = syncState({ brushRange: range, brushSourceId: "throughput" });

    expect(resolveFollowerBrushRange(sync, "errors", "ohlc")).toBeNull();
    expect(resolveFollowerBrushRange(sync, "errors", "throughput")).toEqual(
      range,
    );
  });
});
