import type { ExportChartResult } from "./exportChart";

type JsPdfDocument = {
  addImage: (
    imageData: string,
    format: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void;
  addPage: (
    format: [number, number],
    orientation: "portrait" | "landscape",
  ) => void;
  setFontSize: (size: number) => void;
  text: (text: string, x: number, y: number) => void;
  setProperties: (properties: { title?: string; subject?: string }) => void;
  output: (type: "datauristring") => string;
  internal: {
    getNumberOfPages: () => number;
  };
};

type JsPdfConstructor = new (options: {
  orientation: "portrait" | "landscape";
  unit: "px";
  format: [number, number];
  hotfixes?: string[];
}) => JsPdfDocument;

async function loadJsPdf(): Promise<JsPdfConstructor> {
  const module = await import("jspdf");
  return module.jsPDF as unknown as JsPdfConstructor;
}

const PDF_TITLE_BAND_PX = 28;

export type PdfPageSnapshot = {
  png: ExportChartResult;
  /** Optional per-page title (e.g. from a11y descriptor). */
  title?: string;
};

function pageOrientation(width: number, height: number): "portrait" | "landscape" {
  return width >= height ? "landscape" : "portrait";
}

function pageFormat(
  png: ExportChartResult,
  title?: string,
): { width: number; height: number; imageY: number } {
  const width = Math.max(1, png.width);
  const height = Math.max(1, png.height);
  if (!title) {
    return { width, height, imageY: 0 };
  }
  return {
    width,
    height: height + PDF_TITLE_BAND_PX,
    imageY: PDF_TITLE_BAND_PX,
  };
}

function addPageSnapshot(doc: JsPdfDocument, snapshot: PdfPageSnapshot): void {
  const { png, title } = snapshot;
  const layout = pageFormat(png, title);
  doc.addImage(
    png.dataUrl,
    "PNG",
    0,
    layout.imageY,
    Math.max(1, png.width),
    Math.max(1, png.height),
  );
  if (title) {
    doc.setFontSize(14);
    doc.text(title, 12, 18);
  }
}

/**
 * Embed multiple PNG snapshots as pages in one PDF document.
 * jspdf is lazy-loaded so PNG/SVG export paths stay lightweight.
 */
export async function pngResultsToMultiPagePdf(
  pages: PdfPageSnapshot[],
  metadata?: { title?: string; subject?: string },
): Promise<ExportChartResult> {
  if (pages.length === 0) {
    throw new Error("At least one page is required for multi-page PDF export");
  }

  if (pages.length === 1) {
    return pngResultToPdf(pages[0].png, metadata);
  }

  const JsPDF = await loadJsPdf();
  const firstLayout = pageFormat(pages[0].png, pages[0].title);
  const doc = new JsPDF({
    orientation: pageOrientation(firstLayout.width, firstLayout.height),
    unit: "px",
    format: [firstLayout.width, firstLayout.height],
    hotfixes: ["px_scaling"],
  });

  if (metadata?.title || metadata?.subject) {
    doc.setProperties({
      title: metadata.title,
      subject: metadata.subject,
    });
  }

  addPageSnapshot(doc, pages[0]);

  for (let index = 1; index < pages.length; index += 1) {
    const snapshot = pages[index];
    const layout = pageFormat(snapshot.png, snapshot.title);
    doc.addPage(
      [layout.width, layout.height],
      pageOrientation(layout.width, layout.height),
    );
    addPageSnapshot(doc, snapshot);
  }

  const pageCount = doc.internal.getNumberOfPages();
  const lastPage = pages[pages.length - 1];
  const lastLayout = pageFormat(lastPage.png, lastPage.title);

  return {
    format: "pdf",
    dataUrl: doc.output("datauristring"),
    width: lastLayout.width,
    height: lastLayout.height,
    pageCount,
  };
}

/**
 * Embed a PNG export snapshot in a single-page PDF.
 * jspdf is lazy-loaded so PNG/SVG export paths stay lightweight.
 */
export async function pngResultToPdf(
  png: ExportChartResult,
  metadata?: { title?: string; subject?: string },
): Promise<ExportChartResult> {
  const JsPDF = await loadJsPdf();
  const width = Math.max(1, png.width);
  const height = Math.max(1, png.height);
  const doc = new JsPDF({
    orientation: pageOrientation(width, height),
    unit: "px",
    format: [width, height],
    hotfixes: ["px_scaling"],
  });

  if (metadata?.title || metadata?.subject) {
    doc.setProperties({
      title: metadata.title,
      subject: metadata.subject,
    });
  }

  doc.addImage(png.dataUrl, "PNG", 0, 0, width, height);

  return {
    format: "pdf",
    dataUrl: doc.output("datauristring"),
    width,
    height,
    pageCount: 1,
  };
}
