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
  setProperties: (properties: { title?: string; subject?: string }) => void;
  output: (type: "datauristring") => string;
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
    orientation: width >= height ? "landscape" : "portrait",
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
  };
}
