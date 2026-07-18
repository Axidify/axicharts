import { describe, expect, it } from "vitest";
import { violinFromRows } from "./violinEncoding";

describe("violinFromRows", () => {
  it("groups raw values by category", () => {
    const result = violinFromRows(
      [
        { service: "API", latency_ms: 12 },
        { service: "API", latency_ms: 18 },
        { service: "DB", latency_ms: 30 },
        { service: "DB", latency_ms: 42 },
      ],
      {},
      {
        x: { field: "service" },
        y: { field: "latency_ms" },
      },
    );

    expect(result.items).toHaveLength(2);
    expect(result.items[0]?.category).toBe("API");
    expect(result.items[0]?.samples).toEqual([12, 18]);
    expect(result.items[1]?.samples).toEqual([30, 42]);
  });

  it("pivots multi-series rows", () => {
    const result = violinFromRows(
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
    expect(result.series[0]?.items[0]?.samples).toEqual([12]);
    expect(result.series[1]?.items[0]?.samples).toEqual([20]);
  });
});
