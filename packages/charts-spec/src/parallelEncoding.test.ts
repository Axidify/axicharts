import { describe, expect, it } from "vitest";
import { parallelFromRows, themeRiverFromRows } from "./parallelEncoding";

describe("parallelFromRows", () => {
  it("builds dimensions and series from wide-form rows", () => {
    const rows = [
      { name: "Host A", cpu: 42, memory: 68, latency: 12, errors: 2 },
      { name: "Host B", cpu: 78, memory: 54, latency: 18, errors: 5 },
    ];

    const result = parallelFromRows(
      rows,
      {
        dimensions: [
          { name: "CPU", field: "cpu", max: 100 },
          { name: "Memory", field: "memory", max: 100 },
          { name: "Latency", field: "latency" },
          { name: "Errors", field: "errors" },
        ],
      },
      { name: { field: "name" } },
    );

    expect(result.dimensions).toHaveLength(4);
    expect(result.series).toEqual([
      { name: "Host A", values: [42, 68, 12, 2] },
      { name: "Host B", values: [78, 54, 18, 5] },
    ]);
  });

  it("accepts pre-built series from props", () => {
    const result = parallelFromRows(
      [],
      {
        dimensions: [{ name: "A" }, { name: "B" }],
        series: [{ name: "Series", values: [1, 2] }],
      },
      {},
    );

    expect(result.series).toEqual([{ name: "Series", values: [1, 2] }]);
  });
});

describe("themeRiverFromRows", () => {
  it("builds stream points from long-form rows", () => {
    const rows = [
      { date: "2026-01-01", value: 12, series: "API" },
      { date: "2026-01-01", value: 8, series: "DB" },
      { date: "2026-01-02", value: 15, series: "API" },
    ];

    const result = themeRiverFromRows(
      rows,
      {},
      {
        x: { field: "date", type: "temporal" },
        value: { field: "value" },
        series: { field: "series" },
      },
    );

    expect(result.points).toEqual([
      { time: "2026-01-01", value: 12, series: "API" },
      { time: "2026-01-01", value: 8, series: "DB" },
      { time: "2026-01-02", value: 15, series: "API" },
    ]);
  });
});
