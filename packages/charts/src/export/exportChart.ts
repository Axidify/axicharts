export type ExportChartFormat = "png" | "svg";

export type ExportChartOptions = {
  format: ExportChartFormat;
  /** Background fill for raster export. Defaults to white. */
  background?: string;
  /** Device pixel ratio for PNG export. Defaults to 2. */
  pixelRatio?: number;
};

export type ExportChartResult = {
  format: ExportChartFormat;
  dataUrl: string;
  width: number;
  height: number;
};

type ExportSurface =
  | { kind: "canvas"; node: HTMLCanvasElement }
  | { kind: "svg"; node: SVGSVGElement };

function resolveExportSurface(target: HTMLElement): ExportSurface | null {
  const canvas =
    target.querySelector<HTMLCanvasElement>(".axicharts-echarts canvas") ??
    target.querySelector<HTMLCanvasElement>("canvas");
  if (canvas) {
    return { kind: "canvas", node: canvas };
  }

  const svg = target.querySelector<SVGSVGElement>("svg");
  if (svg) {
    return { kind: "svg", node: svg };
  }

  return null;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load chart image for export"));
    image.src = dataUrl;
  });
}

async function canvasToPng(
  canvas: HTMLCanvasElement,
  background: string,
  pixelRatio: number,
): Promise<ExportChartResult> {
  const width = Math.max(1, Math.floor(canvas.width / pixelRatio));
  const height = Math.max(1, Math.floor(canvas.height / pixelRatio));
  const output = document.createElement("canvas");
  output.width = width * pixelRatio;
  output.height = height * pixelRatio;
  const context = output.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context unavailable for chart export");
  }

  context.fillStyle = background;
  context.fillRect(0, 0, output.width, output.height);
  context.drawImage(canvas, 0, 0, output.width, output.height);

  return {
    format: "png",
    dataUrl: output.toDataURL("image/png"),
    width,
    height,
  };
}

function svgMarkup(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  if (!clone.getAttribute("xmlns")) {
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  return new XMLSerializer().serializeToString(clone);
}

async function svgToPng(
  svg: SVGSVGElement,
  background: string,
  pixelRatio: number,
): Promise<ExportChartResult> {
  const rect = svg.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  const markup = svgMarkup(svg);
  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await loadImage(objectUrl);
    const output = document.createElement("canvas");
    output.width = width * pixelRatio;
    output.height = height * pixelRatio;
    const context = output.getContext("2d");
    if (!context) {
      throw new Error("Canvas 2D context unavailable for SVG export");
    }
    context.fillStyle = background;
    context.fillRect(0, 0, output.width, output.height);
    context.drawImage(image, 0, 0, output.width, output.height);
    return {
      format: "png",
      dataUrl: output.toDataURL("image/png"),
      width,
      height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function svgResult(svg: SVGSVGElement): ExportChartResult {
  const rect = svg.getBoundingClientRect();
  const markup = svgMarkup(svg);
  const encoded = encodeURIComponent(markup);
  return {
    format: "svg",
    dataUrl: `data:image/svg+xml;charset=utf-8,${encoded}`,
    width: Math.max(1, Math.floor(rect.width)),
    height: Math.max(1, Math.floor(rect.height)),
  };
}

async function canvasToSvg(
  canvas: HTMLCanvasElement,
  background: string,
): Promise<ExportChartResult> {
  const width = Math.max(1, Math.floor(canvas.width));
  const height = Math.max(1, Math.floor(canvas.height));
  const png = canvas.toDataURL("image/png");
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${background}"/><image href="${png}" width="${width}" height="${height}"/></svg>`;
  return {
    format: "svg",
    dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`,
    width,
    height,
  };
}

/**
 * Export a chart panel or ChartContainer subtree to PNG or SVG.
 */
export async function exportChart(
  target: HTMLElement,
  options: ExportChartOptions,
): Promise<ExportChartResult> {
  const surface = resolveExportSurface(target);
  if (!surface) {
    throw new Error(
      "No exportable chart surface found. Pass a ChartContainer element with a canvas or SVG child.",
    );
  }

  const background = options.background ?? "#ffffff";
  const pixelRatio = options.pixelRatio ?? 2;

  if (surface.kind === "canvas") {
    if (options.format === "png") {
      return canvasToPng(surface.node, background, pixelRatio);
    }
    return canvasToSvg(surface.node, background);
  }

  if (options.format === "png") {
    return svgToPng(surface.node, background, pixelRatio);
  }
  return svgResult(surface.node);
}

/** Export multiple mosaic panels in document order. */
export async function exportChartBatch(
  targets: HTMLElement[],
  options: ExportChartOptions,
): Promise<ExportChartResult[]> {
  const results: ExportChartResult[] = [];
  for (const target of targets) {
    results.push(await exportChart(target, options));
  }
  return results;
}

/** Trigger a browser download for an export result. */
export function downloadExport(
  result: ExportChartResult,
  filename = `chart.${result.format}`,
): void {
  const anchor = document.createElement("a");
  anchor.href = result.dataUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.click();
}
