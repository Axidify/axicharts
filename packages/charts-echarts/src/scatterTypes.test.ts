import { describe, expect, it } from "vitest";
import type { ScatterSeries } from "./scatterTypes";

function mapScatterSeries(series: ScatterSeries[]) {
  return series.map((item) => ({
    name: item.name,
    pointCount: item.points.length,
    first: item.points[0],
  }));
}

describe("scatter series shape", () => {
  it("preserves point coordinates for ECharts mapping", () => {
    const series: ScatterSeries[] = [
      {
        name: "A",
        points: [
          { x: 1, y: 2, label: "p1" },
          { x: 3, y: 4 },
        ],
      },
    ];
    expect(mapScatterSeries(series)).toEqual([
      { name: "A", pointCount: 2, first: { x: 1, y: 2, label: "p1" } },
    ]);
  });
});
