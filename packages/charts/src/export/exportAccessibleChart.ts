import {
  exportChart,
  type ExportChartOptions,
  type ExportChartResult,
} from "./exportChart";
import { buildChartA11yTable, chartA11yTableToHtml } from "../a11y/a11yTable";
import { enhanceSvgMarkup } from "../a11y/enhanceSvgA11y";
import { resolveChartA11y } from "../a11y/serialize";
import type { ChartA11yDescriptor, ChartA11yTable } from "../a11y/types";

export type ExportAccessibleChartOptions = ExportChartOptions & {
  /** Include data table metadata in the export result. Defaults to true. */
  includeDataTable?: boolean;
  /** Enhance SVG exports with an accessible structure. Defaults to true. */
  enhanceSvg?: boolean;
};

export type AccessibleChartExport = {
  descriptor: ChartA11yDescriptor;
  table: ChartA11yTable;
  tableHtml: string;
};

export type AccessibleChartResult = ExportChartResult & {
  a11y?: AccessibleChartExport;
};

function decodeSvgDataUrl(dataUrl: string): string | null {
  if (!dataUrl.startsWith("data:image/svg+xml")) {
    return null;
  }
  const comma = dataUrl.indexOf(",");
  if (comma < 0) {
    return null;
  }
  const payload = dataUrl.slice(comma + 1);
  if (dataUrl.includes(";base64,")) {
    return atob(payload);
  }
  return decodeURIComponent(payload);
}

function encodeSvgDataUrl(markup: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

/**
 * Export a chart with accessibility metadata — SVG a11y tree and/or data table fallback.
 */
export async function exportAccessibleChart(
  target: HTMLElement,
  options: ExportAccessibleChartOptions,
): Promise<AccessibleChartResult> {
  const includeDataTable = options.includeDataTable ?? true;
  const enhanceSvg = options.enhanceSvg ?? true;
  const descriptor = resolveChartA11y(target);
  const chartTitle = descriptor?.title;
  const result = await exportChart(target, {
    ...options,
    title: options.title ?? chartTitle,
    subject:
      options.subject ??
      (descriptor && includeDataTable ?
        `Chart data export (${descriptor.kind})`
      : undefined),
  });

  if (!descriptor) {
    return result;
  }

  const table = includeDataTable ? buildChartA11yTable(descriptor) : undefined;
  const tableHtml = table ? chartA11yTableToHtml(table) : undefined;
  let dataUrl = result.dataUrl;

  if (enhanceSvg && result.format === "svg" && table) {
    const markup = decodeSvgDataUrl(result.dataUrl);
    if (markup) {
      dataUrl = encodeSvgDataUrl(enhanceSvgMarkup(markup, descriptor));
    }
  }

  return {
    ...result,
    dataUrl,
    a11y:
      table && tableHtml ?
        {
          descriptor,
          table,
          tableHtml,
        }
      : undefined,
  };
}

/** Trigger a browser download for an accessible data table HTML snapshot. */
export function downloadAccessibleTable(
  exportResult: AccessibleChartExport,
  filename = "chart-data.html",
): void {
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${exportResult.descriptor.kind === "cartesian" ? exportResult.descriptor.title ?? "Chart data" : exportResult.descriptor.title}</title></head><body>${exportResult.tableHtml}</body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.click();
  URL.revokeObjectURL(url);
}
