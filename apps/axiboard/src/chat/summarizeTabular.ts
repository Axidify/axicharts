import { parseTabular } from "@axicharts/charts-spec/planning";

export type TabularPreview = {
  rowCount: number;
  columnCount: number;
  columns: string[];
};

export function summarizeTabular(tabular: string): TabularPreview {
  const rows = parseTabular(tabular);
  const columns = rows[0] ? Object.keys(rows[0]) : [];
  return {
    rowCount: rows.length,
    columnCount: columns.length,
    columns,
  };
}
