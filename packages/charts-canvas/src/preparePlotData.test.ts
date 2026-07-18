import { describe, expect, it } from "vitest";
import { preparePlotData } from "./preparePlotData";

describe("preparePlotData", () => {
  const categories = Array.from({ length: 100 }, (_, index) => `t${index}`);
  const series = [
    { name: "A", data: Array.from({ length: 100 }, (_, index) => index) },
    { name: "B", data: Array.from({ length: 100 }, () => 1) },
  ];

  it("returns input unchanged when under maxPoints", () => {
    const result = preparePlotData(categories, series, null);
    expect(result.sampled).toBe(false);
    expect(result.categories).toEqual(categories);
    expect(result.series).toEqual(series);
  });

  it("downsamples categories and all series together", () => {
    const spikeSeries = [
      {
        name: "A",
        data: Array.from({ length: 100 }, (_, index) =>
          index === 50 ? 100 : 1,
        ),
      },
      {
        name: "B",
        data: Array.from({ length: 100 }, (_, index) => index * 2),
      },
    ];
    const result = preparePlotData(categories, spikeSeries, 12);
    expect(result.sampled).toBe(true);
    expect(result.categories).toHaveLength(12);
    expect(result.series[0].data).toHaveLength(12);
    expect(result.series[1].data).toHaveLength(12);
    expect(result.categories).toContain("t50");
    expect(result.series[1].data).toContain(100);
  });

  it("downsamples per-category sizes with series data", () => {
    const sizedSeries = [
      {
        name: "A",
        data: Array.from({ length: 100 }, (_, index) =>
          index === 50 ? 100 : 1,
        ),
        sizes: Array.from({ length: 100 }, (_, index) => index + 1),
      },
    ];
    const result = preparePlotData(categories, sizedSeries, 12);
    expect(result.series[0].sizes).toHaveLength(12);
    expect(result.series[0].sizes).toContain(51);
  });
});
