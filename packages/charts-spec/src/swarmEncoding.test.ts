import { describe, expect, it } from "vitest";
import { swarmFromRows } from "./swarmEncoding";

describe("swarmFromRows", () => {
  it("groups raw values by category", () => {
    const result = swarmFromRows(
      [
        { service: "API", latency_ms: 12 },
        { service: "API", latency_ms: 18 },
        { service: "DB", latency_ms: 30 },
      ],
      {},
      {
        x: { field: "service" },
        y: { field: "latency_ms" },
      },
    );

    expect(result.items).toEqual([
      { category: "API", values: [12, 18] },
      { category: "DB", values: [30] },
    ]);
    expect(result.series).toEqual([]);
  });

  it("pivots multi-series rows", () => {
    const result = swarmFromRows(
      [
        { service: "API", region: "US", latency_ms: 12 },
        { service: "API", region: "EU", latency_ms: 20 },
        { service: "DB", region: "US", latency_ms: 30 },
      ],
      {},
      {
        x: { field: "service" },
        y: { field: "latency_ms" },
        series: { field: "region" },
      },
    );

    expect(result.series).toHaveLength(2);
    expect(result.series[0]?.name).toBe("US");
    expect(result.series[0]?.items[0]?.values).toEqual([12]);
    expect(result.series[1]?.items[0]?.values).toEqual([20]);
  });
});
