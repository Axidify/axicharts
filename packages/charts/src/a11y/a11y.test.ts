/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { buildCartesianA11yDescriptor } from "./cartesianDescriptor";
import {
  buildCandlestickA11yDescriptor,
  buildFunnelA11yDescriptor,
  buildHeatmapA11yDescriptor,
  buildHierarchyA11yDescriptor,
  buildParallelA11yDescriptor,
  buildPieA11yDescriptor,
  buildThemeRiverA11yDescriptor,
  buildWordCloudA11yDescriptor,
} from "./echartsDescriptor";
import { buildSingleValueA11yDescriptor } from "./singleValueDescriptor";
import { buildChartA11yTable, chartA11yTableToHtml } from "./a11yTable";
import { parseA11yDescriptor, serializeA11yDescriptor } from "./serialize";
import { enhanceSvgMarkup } from "./enhanceSvgA11y";

describe("chart a11y", () => {
  const descriptor = buildCartesianA11yDescriptor({
    chartType: "line",
    categories: ["Mon", "Tue"],
    series: [{ name: "Signups", data: [42, 58] }],
  });

  it("builds a tabular fallback from cartesian data", () => {
    const table = buildChartA11yTable(descriptor);
    expect(table.columns.map((column) => column.key)).toEqual([
      "category",
      "Signups",
    ]);
    expect(table.rows).toEqual([
      { category: "Mon", Signups: 42 },
      { category: "Tue", Signups: 58 },
    ]);
  });

  it("round-trips descriptor serialization", () => {
    const raw = serializeA11yDescriptor(descriptor);
    expect(parseA11yDescriptor(raw)).toEqual(descriptor);
  });

  it("enhances exported SVG with title and data table", () => {
    const markup =
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60"><rect width="100" height="60" fill="#fff"/></svg>';
    const enhanced = enhanceSvgMarkup(markup, descriptor);
    expect(enhanced).toContain("<title");
    expect(enhanced).toContain("<desc");
    expect(enhanced).toContain('role="graphics-document"');
    expect(enhanced).toContain("<table>");
    expect(enhanced).toContain("Signups");
  });

  it("renders table html for download fallback", () => {
    const html = chartA11yTableToHtml(buildChartA11yTable(descriptor));
    expect(html).toContain("<caption>");
    expect(html).toContain("Signups</th>");
    expect(html).toContain(">58</td>");
  });

  it("builds pie a11y table with share column", () => {
    const pie = buildPieA11yDescriptor({
      slices: [
        { name: "A", value: 25 },
        { name: "B", value: 75 },
      ],
      innerRadius: 40,
    });
    const table = buildChartA11yTable(pie);
    expect(pie.chartType).toBe("donut");
    expect(table.rows).toEqual([
      { segment: "A", value: 25, share: "25.0%" },
      { segment: "B", value: 75, share: "75.0%" },
    ]);
    expect(parseA11yDescriptor(serializeA11yDescriptor(pie))).toEqual(pie);
  });

  it("builds candlestick a11y table with OHLC columns", () => {
    const candlestick = buildCandlestickA11yDescriptor({
      categories: ["Mon"],
      data: [{ open: 10, high: 12, low: 9, close: 11 }],
      volume: [1000],
    });
    const table = buildChartA11yTable(candlestick);
    expect(table.rows[0]).toEqual({
      category: "Mon",
      open: 10,
      high: 12,
      low: 9,
      close: 11,
      volume: 1000,
    });
  });

  it("builds heatmap a11y table as flat x/y/value rows", () => {
    const heatmap = buildHeatmapA11yDescriptor({
      matrix: {
        xCategories: ["A", "B"],
        yCategories: ["Y1"],
        values: [[1, 2]],
      },
    });
    const table = buildChartA11yTable(heatmap);
    expect(table.rows).toEqual([
      { x: "A", y: "Y1", value: 1 },
      { x: "B", y: "Y1", value: 2 },
    ]);
  });

  it("builds funnel a11y table with share column", () => {
    const funnel = buildFunnelA11yDescriptor({
      stages: [
        { name: "Visit", value: 100 },
        { name: "Buy", value: 20 },
      ],
    });
    const table = buildChartA11yTable(funnel);
    expect(table.rows[1]).toEqual({
      stage: "Buy",
      value: 20,
      share: "16.7%",
    });
  });

  it("builds hierarchy a11y table from nested nodes", () => {
    const hierarchy = buildHierarchyA11yDescriptor({
      chartType: "treemap",
      nodes: [
        {
          name: "Root",
          children: [
            { name: "Leaf", value: 5 },
          ],
        },
      ],
    });
    const table = buildChartA11yTable(hierarchy);
    expect(table.rows).toEqual([{ path: "Root > Leaf", value: 5 }]);
  });

  it("builds parallel a11y table with dimension columns", () => {
    const parallel = buildParallelA11yDescriptor({
      dimensions: [{ name: "CPU" }, { name: "Memory" }],
      series: [{ name: "Host A", values: [42, 68] }],
    });
    const table = buildChartA11yTable(parallel);
    expect(table.rows).toEqual([{ series: "Host A", CPU: 42, Memory: 68 }]);
  });

  it("builds theme river a11y table with time/series/value", () => {
    const themeRiver = buildThemeRiverA11yDescriptor({
      points: [
        { time: "2026-01-01", value: 12, series: "API" },
        { time: "2026-01-02", value: 15, series: "API" },
      ],
    });
    const table = buildChartA11yTable(themeRiver);
    expect(table.rows[0]).toEqual({
      time: "2026-01-01",
      series: "API",
      value: 12,
    });
  });

  it("builds word cloud a11y table with text/weight/share", () => {
    const wordCloud = buildWordCloudA11yDescriptor({
      words: [
        { text: "timeout", value: 40 },
        { text: "retry", value: 10 },
      ],
    });
    const table = buildChartA11yTable(wordCloud);
    expect(table.rows[0]).toEqual({
      text: "timeout",
      value: 40,
      share: "80.0%",
    });
    expect(table.rows[1]).toEqual({
      text: "retry",
      value: 10,
      share: "20.0%",
    });
  });

  it("builds single-value a11y table for stat/gauge panels", () => {
    const singleValue = buildSingleValueA11yDescriptor({
      title: "Uptime",
      value: "98.4%",
      description: "Tone: success; Range 0–100",
    });
    const table = buildChartA11yTable(singleValue);
    expect(table.rows).toEqual([{ label: "Uptime", value: "98.4%" }]);
    expect(table.caption).toBe("Tone: success; Range 0–100");
    expect(parseA11yDescriptor(serializeA11yDescriptor(singleValue))).toEqual(
      singleValue,
    );
  });

  it("enhances single-value SVG exports with metric table", () => {
    const singleValue = buildSingleValueA11yDescriptor({
      title: "CPU",
      value: "72%",
    });
    const markup =
      '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><circle cx="60" cy="40" r="30"/></svg>';
    const enhanced = enhanceSvgMarkup(markup, singleValue);
    expect(enhanced).toContain("<title");
    expect(enhanced).toContain("CPU");
    expect(enhanced).toContain("72%");
    expect(enhanced).toContain("<table>");
  });
});
