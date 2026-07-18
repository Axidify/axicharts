import type { ChartA11yDescriptor, ChartA11yTable } from "./types";
import { cartesianA11ySummary } from "./cartesianDescriptor";
import {
  formatFunnelShare,
  formatPieShare,
  funnelA11ySummary,
  heatmapA11ySummary,
  hierarchyA11ySummary,
  pieA11ySummary,
} from "./echartsDescriptor";

export function buildChartA11yTable(descriptor: ChartA11yDescriptor): ChartA11yTable {
  if (descriptor.kind === "single-value") {
    return {
      columns: [
        { key: "label", label: "Metric" },
        { key: "value", label: "Value", align: "right" },
      ],
      rows: [{ label: descriptor.title, value: descriptor.value }],
      caption: descriptor.description ?? descriptor.title,
    };
  }

  if (descriptor.kind === "pie") {
    return {
      columns: [
        { key: "segment", label: "Segment" },
        { key: "value", label: "Value", align: "right" },
        { key: "share", label: "Share", align: "right" },
      ],
      rows: descriptor.slices.map((slice) => ({
        segment: slice.name,
        value: slice.value,
        share: formatPieShare(slice.value, descriptor.slices),
      })),
      caption: descriptor.description ?? pieA11ySummary(descriptor),
    };
  }

  if (descriptor.kind === "candlestick") {
    const hasVolume = descriptor.data.some((point) => point.volume != null);
    const columns = [
      { key: "category", label: "Period" },
      { key: "open", label: "Open", align: "right" as const },
      { key: "high", label: "High", align: "right" as const },
      { key: "low", label: "Low", align: "right" as const },
      { key: "close", label: "Close", align: "right" as const },
      ...(hasVolume ? [{ key: "volume", label: "Volume", align: "right" as const }] : []),
    ];
    const rows = descriptor.categories.map((category, index) => {
      const point = descriptor.data[index];
      const row: Record<string, string | number> = {
        category,
        open: point?.open ?? "",
        high: point?.high ?? "",
        low: point?.low ?? "",
        close: point?.close ?? "",
      };
      if (hasVolume) {
        row.volume = point?.volume ?? "";
      }
      return row;
    });
    return {
      columns,
      rows,
      caption: descriptor.description ?? descriptor.title ?? "Candlestick chart",
    };
  }

  if (descriptor.kind === "heatmap") {
    const rows: Record<string, string | number>[] = [];
    descriptor.yCategories.forEach((yCategory, yIndex) => {
      descriptor.xCategories.forEach((xCategory, xIndex) => {
        rows.push({
          x: xCategory,
          y: yCategory,
          value: descriptor.values[yIndex]?.[xIndex] ?? "",
        });
      });
    });
    return {
      columns: [
        { key: "x", label: descriptor.xLabel ?? "Column" },
        { key: "y", label: descriptor.yLabel ?? "Row" },
        { key: "value", label: "Value", align: "right" },
      ],
      rows,
      caption: descriptor.description ?? heatmapA11ySummary(descriptor),
    };
  }

  if (descriptor.kind === "funnel") {
    return {
      columns: [
        { key: "stage", label: "Stage" },
        { key: "value", label: "Value", align: "right" },
        { key: "share", label: "Share", align: "right" },
      ],
      rows: descriptor.stages.map((stage) => ({
        stage: stage.name,
        value: stage.value,
        share: formatFunnelShare(stage.value, descriptor.stages),
      })),
      caption: descriptor.description ?? funnelA11ySummary(descriptor),
    };
  }

  if (descriptor.kind === "hierarchy") {
    return {
      columns: [
        { key: "path", label: "Path" },
        { key: "value", label: "Value", align: "right" },
      ],
      rows: descriptor.items.map((item) => ({
        path: item.path ?? item.name,
        value: item.value,
      })),
      caption: descriptor.description ?? hierarchyA11ySummary(descriptor),
    };
  }

  const categoryKey = "category";
  const columns = [
    { key: categoryKey, label: descriptor.categoryLabel ?? "Category" },
    ...descriptor.series.map((item) => ({
      key: item.name,
      label: item.name,
      align: "right" as const,
    })),
  ];
  const rows = descriptor.categories.map((category, index) => {
    const row: Record<string, string | number> = { [categoryKey]: category };
    for (const item of descriptor.series) {
      row[item.name] = item.values[index] ?? "";
    }
    return row;
  });

  return {
    columns,
    rows,
    caption: descriptor.description ?? cartesianA11ySummary(descriptor),
  };
}

export function chartA11yTableToHtml(table: ChartA11yTable): string {
  const header = table.columns
    .map(
      (column) =>
        `<th scope="col" style="text-align:${column.align ?? "left"}">${escapeHtml(column.label)}</th>`,
    )
    .join("");
  const body = table.rows
    .map((row) => {
      const cells = table.columns
        .map((column) => {
          const value = row[column.key];
          return `<td style="text-align:${column.align ?? "left"}">${escapeHtml(value == null ? "" : String(value))}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  const caption = table.caption
    ? `<caption>${escapeHtml(table.caption)}</caption>`
    : "";
  return `<table>${caption}<thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
