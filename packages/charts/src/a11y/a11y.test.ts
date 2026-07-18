/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { buildCartesianA11yDescriptor } from "./cartesianDescriptor";
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
});
