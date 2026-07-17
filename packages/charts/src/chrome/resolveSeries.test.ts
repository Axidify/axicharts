import { describe, expect, it } from "vitest";
import type { PlotSeries } from "@axicharts/charts-canvas";
import { resolveSeriesColor, resolveSeriesLabel } from "./resolveSeries";

describe("resolveSeries", () => {
  it("prefers explicit series color over config", () => {
    const series: PlotSeries = {
      key: "latency",
      name: "Latency",
      data: [1],
      color: "#111111",
    };

    expect(
      resolveSeriesColor(series, {
        latency: { color: "#222222" },
      }),
    ).toBe("#111111");
  });

  it("resolves config by series key when name is a label", () => {
    const series: PlotSeries = {
      key: "latency",
      name: "p95 latency",
      data: [1],
    };

    expect(
      resolveSeriesColor(series, {
        latency: { color: "hsl(var(--chart-1))" },
      }),
    ).toBe("hsl(var(--chart-1))");
    expect(
      resolveSeriesLabel(series, {
        latency: { label: "p95 latency" },
      }),
    ).toBe("p95 latency");
  });
});
