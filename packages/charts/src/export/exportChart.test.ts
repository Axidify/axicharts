/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { exportChart } from "./exportChart";

describe("exportChart", () => {
  it("exports a canvas chart to PNG", async () => {
    const container = document.createElement("div");
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 80;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = "#2563eb";
      context.fillRect(0, 0, 120, 80);
    }
    container.appendChild(canvas);

    const result = await exportChart(container, { format: "png" });
    expect(result.format).toBe("png");
    expect(result.dataUrl.startsWith("data:image/png")).toBe(true);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it("exports an inline SVG chart to SVG", async () => {
    const container = document.createElement("div");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "60");
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "100");
    rect.setAttribute("height", "60");
    rect.setAttribute("fill", "#16a34a");
    svg.appendChild(rect);
    container.appendChild(svg);

    const result = await exportChart(container, { format: "svg" });
    expect(result.format).toBe("svg");
    expect(result.dataUrl).toContain("image/svg+xml");
  });
});
