import { describe, expect, it } from "vitest";
import { aggregateSnapshots } from "./aggregateSnapshots";
import type { DataSourceSnapshot } from "./types";

describe("aggregateSnapshots", () => {
  it("merges data and surfaces the first error", () => {
    const snapshots: Record<string, DataSourceSnapshot> = {
      ops: {
        data: { categories: ["Mon"], cells: [] },
        connection: "ready",
        lastUpdatedAt: 100,
      },
      finance: {
        data: { kpis: [{ label: "Revenue", value: "$1M" }] },
        connection: "error",
        error: "HTTP 503",
        lastUpdatedAt: 200,
      },
    };

    const merged = aggregateSnapshots(snapshots, "ops");
    expect(merged.connection).toBe("error");
    expect(merged.error).toBe("HTTP 503");
    expect(merged.data.categories).toEqual(["Mon"]);
    expect(merged.data.kpis).toBeTruthy();
    expect(merged.lastUpdatedAt).toBe(200);
  });
});
