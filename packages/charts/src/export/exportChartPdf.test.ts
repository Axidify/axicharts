/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { exportChart, exportChartBatch } from "./exportChart";
import { pngResultToPdf, pngResultsToMultiPagePdf } from "./exportChartPdf";

const mockAddImage = vi.fn();
const mockAddPage = vi.fn();
const mockSetFontSize = vi.fn();
const mockText = vi.fn();
const mockSetProperties = vi.fn();
const mockOutput = vi.fn(() => "data:application/pdf;base64,mock-pdf");
const mockGetNumberOfPages = vi.fn(() => 1);

vi.mock("jspdf", () => ({
  jsPDF: class {
    addImage = mockAddImage;
    addPage = mockAddPage;
    setFontSize = mockSetFontSize;
    text = mockText;
    setProperties = mockSetProperties;
    output = mockOutput;
    internal = {
      getNumberOfPages: mockGetNumberOfPages,
    };
  },
}));

describe("pngResultToPdf", () => {
  beforeEach(() => {
    mockAddImage.mockClear();
    mockAddPage.mockClear();
    mockSetFontSize.mockClear();
    mockText.mockClear();
    mockSetProperties.mockClear();
    mockOutput.mockClear();
    mockGetNumberOfPages.mockReset();
    mockGetNumberOfPages.mockReturnValue(1);
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
    expect(result.pageCount).toBe(1);
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
    expect(mockAddPage).not.toHaveBeenCalled();
  });
});

describe("pngResultsToMultiPagePdf", () => {
  beforeEach(() => {
    mockAddImage.mockClear();
    mockAddPage.mockClear();
    mockSetFontSize.mockClear();
    mockText.mockClear();
    mockSetProperties.mockClear();
    mockOutput.mockClear();
    mockGetNumberOfPages.mockReset();
    mockGetNumberOfPages.mockReturnValue(3);
  });

  it("creates one PDF page per PNG snapshot", async () => {
    const pages = [
      {
        png: {
          format: "png" as const,
          dataUrl: "data:image/png;base64,one",
          width: 300,
          height: 180,
        },
        title: "Revenue",
      },
      {
        png: {
          format: "png" as const,
          dataUrl: "data:image/png;base64,two",
          width: 280,
          height: 160,
        },
        title: "Churn",
      },
      {
        png: {
          format: "png" as const,
          dataUrl: "data:image/png;base64,three",
          width: 260,
          height: 140,
        },
      },
    ];

    const result = await pngResultsToMultiPagePdf(pages, {
      title: "Ops mosaic",
      subject: "Weekly review",
    });

    expect(result.format).toBe("pdf");
    expect(result.pageCount).toBe(3);
    expect(mockAddPage).toHaveBeenCalledTimes(2);
    expect(mockAddImage).toHaveBeenCalledTimes(3);
    expect(mockSetProperties).toHaveBeenCalledWith({
      title: "Ops mosaic",
      subject: "Weekly review",
    });
    expect(mockText).toHaveBeenCalledWith("Revenue", 12, 18);
    expect(mockText).toHaveBeenCalledWith("Churn", 12, 18);
  });
});

describe("exportChart pdf format", () => {
  beforeEach(() => {
    mockAddImage.mockClear();
    mockAddPage.mockClear();
    mockGetNumberOfPages.mockReset();
    mockGetNumberOfPages.mockReturnValue(1);
  });

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

describe("exportChartBatch multi-page pdf", () => {
  beforeEach(() => {
    mockAddImage.mockClear();
    mockAddPage.mockClear();
    mockGetNumberOfPages.mockReset();
    mockGetNumberOfPages.mockReturnValue(2);
  });

  function panel(width: number, height: number): HTMLDivElement {
    const container = document.createElement("div");
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = "#2563eb";
      context.fillRect(0, 0, width, height);
    }
    container.appendChild(canvas);
    return container;
  }

  it("combines batch panels into one multi-page PDF", async () => {
    const result = await exportChartBatch([panel(120, 80), panel(100, 60)], {
      format: "pdf",
      multiPage: true,
      title: "Mosaic wall",
    });

    expect(result).not.toBeInstanceOf(Array);
    if (Array.isArray(result)) {
      throw new Error("expected single PDF result");
    }
    expect(result.format).toBe("pdf");
    expect(result.pageCount).toBe(2);
    expect(mockAddPage).toHaveBeenCalledTimes(1);
    expect(mockAddImage).toHaveBeenCalledTimes(2);
  });
});
