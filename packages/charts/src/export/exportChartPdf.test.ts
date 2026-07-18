/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { exportChart } from "./exportChart";
import { pngResultToPdf } from "./exportChartPdf";

const mockAddImage = vi.fn();
const mockSetProperties = vi.fn();
const mockOutput = vi.fn(() => "data:application/pdf;base64,mock-pdf");

vi.mock("jspdf", () => ({
  jsPDF: class {
    addImage = mockAddImage;
    setProperties = mockSetProperties;
    output = mockOutput;
  },
}));

describe("pngResultToPdf", () => {
  beforeEach(() => {
    mockAddImage.mockClear();
    mockSetProperties.mockClear();
    mockOutput.mockClear();
  });

  it("embeds a PNG snapshot in a single-page PDF", async () => {
    const png = {
      format: "png" as const,
      dataUrl: "data:image/png;base64,abc",
      width: 320,
      height: 200,
    };

    const result = await pngResultToPdf(png, {
      title: "Revenue trend",
      subject: "Chart export",
    });

    expect(result.format).toBe("pdf");
    expect(result.dataUrl).toContain("application/pdf");
    expect(result.width).toBe(320);
    expect(result.height).toBe(200);
    expect(mockSetProperties).toHaveBeenCalledWith({
      title: "Revenue trend",
      subject: "Chart export",
    });
    expect(mockAddImage).toHaveBeenCalledWith(
      "data:image/png;base64,abc",
      "PNG",
      0,
      0,
      320,
      200,
    );
  });
});

describe("exportChart pdf format", () => {
  it("exports a canvas chart to PDF via raster embed", async () => {
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

    const result = await exportChart(container, {
      format: "pdf",
      title: "Line chart",
    });

    expect(result.format).toBe("pdf");
    expect(result.dataUrl).toContain("application/pdf");
    expect(mockAddImage).toHaveBeenCalled();
  });
});
