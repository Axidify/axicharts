import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import * as cartesian from "./cartesian";
import * as distribution from "./distribution";
import * as financial from "./financial";
import * as matrix from "./matrix";
import * as industrial from "./industrial";
import * as kpi from "./kpi";
import * as full from "./full";

describe("category entrypoints", () => {
  it("exports cartesian chart symbols", () => {
    expect(cartesian.LineChart).toBeTypeOf("function");
    expect(cartesian.AreaChart).toBeTypeOf("function");
    expect(cartesian.BarChart).toBeTypeOf("function");
    expect(cartesian.ComboChart).toBeTypeOf("function");
    expect(cartesian.ScatterChart).toBeTypeOf("function");
    expect(cartesian.ChartContainer).toBeTypeOf("function");
    expect(cartesian.ChartSyncGroup).toBeTypeOf("function");
  });

  it("exports distribution chart symbols", () => {
    expect(distribution.PieChart).toBeTypeOf("function");
    expect(distribution.FunnelChart).toBeTypeOf("function");
    expect(distribution.BoxplotChart).toBeTypeOf("function");
    expect(distribution.HistogramChart).toBeTypeOf("function");
  });

  it("exports financial chart symbols", () => {
    expect(financial.WaterfallChart).toBeTypeOf("function");
    expect(financial.CandlestickChart).toBeTypeOf("function");
  });

  it("exports matrix chart symbols", () => {
    expect(matrix.HeatmapChart).toBeTypeOf("function");
    expect(matrix.RadarChart).toBeTypeOf("function");
    expect(matrix.ParallelChart).toBeTypeOf("function");
    expect(matrix.ThemeRiverChart).toBeTypeOf("function");
    expect(matrix.WordCloudChart).toBeTypeOf("function");
    expect(matrix.TreemapChart).toBeTypeOf("function");
    expect(matrix.SunburstChart).toBeTypeOf("function");
  });

  it("exports industrial HMI symbols", () => {
    expect(industrial.Gauge).toBeTypeOf("function");
    expect(industrial.Digital).toBeTypeOf("function");
    expect(industrial.StatusLamp).toBeTypeOf("function");
  });

  it("exports KPI symbols", () => {
    expect(kpi.Stat).toBeTypeOf("function");
    expect(kpi.presentationEnterStyle).toBeTypeOf("function");
  });

  it("exports quick hello-world symbol", async () => {
    const quick = await import("./quick");
    expect(quick.QuickLineChart).toBeTypeOf("function");
  });

  it("full re-exports the root barrel", () => {
    expect(full.LineChart).toBeTypeOf("function");
    expect(full.PieChart).toBeTypeOf("function");
    expect(full.Stat).toBeTypeOf("function");
    expect(full.registerChartType).toBeTypeOf("function");
  });
});

describe("category bundle isolation", () => {
  it("cartesian dist entry does not reference matrix chart modules", () => {
    const cartesianBundle = readFileSync(
      path.resolve(__dirname, "../../dist/entry/cartesian.js"),
      "utf8",
    );

    expect(cartesianBundle).not.toContain("TreemapChart");
    expect(cartesianBundle).not.toContain("HeatmapChart");
    expect(cartesianBundle).not.toContain("WordCloudChart");
    expect(cartesianBundle).toContain("LineChart");
  });
});
