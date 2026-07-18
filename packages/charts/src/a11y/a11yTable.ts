import type { ChartA11yDescriptor, ChartA11yTable } from "./types";
import { cartesianA11ySummary } from "./cartesianDescriptor";

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
