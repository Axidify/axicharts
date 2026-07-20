import { describe, expect, it } from "vitest";
import type { PlotSeries } from "@axicharts/charts-canvas";
import {
  applyChartConfigToPieSlices,
  applyChartConfigToSeries,
} from "./applyChartConfig";

describe("applyChartConfigToSeries", () => {
  it("applies label and color by series key", () => {
    const series: PlotSeries[] = [
      { key: "revenue", name: "revenue", data: [1, 2, 3] },
      { key: "margin", name: "margin", data: [4, 5, 6], tone: "warning" },
    ];

    const configured = applyChartConfigToSeries(series, {
      revenue: { label: "Revenue", color: "#22c55e" },
      margin: { label: "Margin", color: "#f59e0b" },
    });

    expect(configured[0]).toMatchObject({
      name: "Revenue",
      color: "#22c55e",
    });
    expect(configured[1]).toMatchObject({
      name: "Margin",
      color: "#f59e0b",
      tone: "warning",
    });
  });

  it("applies per-category fills for a single-series bar chart", () => {
    const configured = applyChartConfigToSeries(
      [{ name: "Tasks", data: [4, 18, 4] }],
      {
        "P1 – Critical": { color: "#f43f5e" },
        "P2 – High": { color: "#f59e0b" },
        "P3 – Medium": { color: "#3b82f6" },
      },
      {
        categories: ["P1 – Critical", "P2 – High", "P3 – Medium"],
      },
    );

    expect(configured[0]?.fills).toEqual(["#f43f5e", "#f59e0b", "#3b82f6"]);
  });
});

describe("applyChartConfigToPieSlices", () => {
  it("applies config colors to slice keys", () => {
    const slices = applyChartConfigToPieSlices(
      [{ key: "support", name: "support", value: 14 }],
      {
        support: { label: "Support", color: "#ef4444" },
      },
    );

    expect(slices[0]).toEqual({
      key: "support",
      name: "Support",
      value: 14,
      color: "#ef4444",
    });
  });
});
