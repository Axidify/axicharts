/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { buildCartesianA11yDescriptor } from "../a11y/cartesianDescriptor";
import { buildPieA11yDescriptor } from "../a11y/echartsDescriptor";
import { buildSingleValueA11yDescriptor } from "../a11y/singleValueDescriptor";
import { serializeA11yDescriptor, CHART_A11Y_ATTR } from "../a11y/serialize";
import { exportAccessibleChart } from "./exportAccessibleChart";

describe("exportAccessibleChart", () => {
  it("returns data table metadata for canvas charts", async () => {
    const container = document.createElement("div");
    const descriptor = buildCartesianA11yDescriptor({
      chartType: "line",
      categories: ["Mon", "Tue"],
      series: [{ name: "Revenue", data: [10, 20] }],
    });
    container.setAttribute(CHART_A11Y_ATTR, serializeA11yDescriptor(descriptor));

    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 80;
    container.appendChild(canvas);

    const result = await exportAccessibleChart(container, { format: "png" });
    expect(result.a11y?.table.rows).toEqual([
      { category: "Mon", Revenue: 10 },
      { category: "Tue", Revenue: 20 },
    ]);
    expect(result.a11y?.tableHtml).toContain("Revenue");
  });

  it("enhances inline SVG exports with an a11y tree", async () => {
    const container = document.createElement("div");
    const descriptor = buildCartesianA11yDescriptor({
      chartType: "bar",
      categories: ["A"],
      series: [{ name: "Count", data: [5] }],
    });
    container.setAttribute(CHART_A11Y_ATTR, serializeA11yDescriptor(descriptor));

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "60");
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "100");
    rect.setAttribute("height", "60");
    svg.appendChild(rect);
    container.appendChild(svg);
    document.body.appendChild(container);

    const result = await exportAccessibleChart(container, { format: "svg" });
    expect(result.format).toBe("svg");
    expect(result.a11y?.table.rows).toEqual([{ category: "A", Count: 5 }]);
    const payload = result.dataUrl.slice(result.dataUrl.indexOf(",") + 1);
    const markup = decodeURIComponent(payload);
    expect(markup).toContain("<title");
    expect(markup).toContain("Count");

    container.remove();
  });

  it("resolves pie a11y metadata from nested ECharts root", async () => {
    const container = document.createElement("div");
    const descriptor = buildPieA11yDescriptor({
      slices: [
        { name: "Alpha", value: 30 },
        { name: "Beta", value: 70 },
      ],
    });
    const root = document.createElement("div");
    root.setAttribute(CHART_A11Y_ATTR, serializeA11yDescriptor(descriptor));
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 80;
    root.appendChild(canvas);
    container.appendChild(root);

    const result = await exportAccessibleChart(container, { format: "png" });
    expect(result.a11y?.table.rows).toEqual([
      { segment: "Alpha", value: 30, share: "30.0%" },
      { segment: "Beta", value: 70, share: "70.0%" },
    ]);
  });

  it("resolves gauge a11y metadata from nested single-value root", async () => {
    const container = document.createElement("div");
    const descriptor = buildSingleValueA11yDescriptor({
      title: "Tank level",
      value: "72%",
      description: "Range 0–100; Tone: warning",
    });
    const root = document.createElement("div");
    root.setAttribute(CHART_A11Y_ATTR, serializeA11yDescriptor(descriptor));
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "120");
    svg.setAttribute("height", "80");
    root.appendChild(svg);
    container.appendChild(root);
    document.body.appendChild(container);

    const result = await exportAccessibleChart(container, { format: "svg" });
    expect(result.a11y?.table.rows).toEqual([
      { label: "Tank level", value: "72%" },
    ]);
    const payload = result.dataUrl.slice(result.dataUrl.indexOf(",") + 1);
    const markup = decodeURIComponent(payload);
    expect(markup).toContain("Tank level");

    container.remove();
  });
});
