import type { CSSProperties, ReactElement } from "react";
import type { StatSurface, StatTone } from "../stat/Stat";

export type TableColumn = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  monospace?: boolean;
  toneKey?: string;
};

export type TableRow = Record<string, string | number>;

export type DataTableProps = {
  columns: TableColumn[];
  rows: TableRow[];
  surface?: StatSurface;
  compact?: boolean;
  caption?: string;
  style?: CSSProperties;
};

const TONE_COLORS: Record<StatSurface, Record<StatTone, string>> = {
  dark: {
    neutral: "#e2e8f0",
    success: "#4ade80",
    warning: "#fbbf24",
    critical: "#f87171",
  },
  light: {
    neutral: "#0f172a",
    success: "#16a34a",
    warning: "#d97706",
    critical: "#dc2626",
  },
};

function cellTone(
  row: TableRow,
  column: TableColumn,
): StatTone | undefined {
  if (!column.toneKey) return undefined;
  const tone = row[column.toneKey];
  if (
    tone === "success" ||
    tone === "warning" ||
    tone === "critical" ||
    tone === "neutral"
  ) {
    return tone;
  }
  return undefined;
}

export function DataTable({
  columns,
  rows,
  surface = "dark",
  compact = false,
  caption,
  style,
}: DataTableProps): ReactElement {
  const borderColor = surface === "light" ? "#e2e8f0" : "#334155";
  const headerColor = surface === "light" ? "#64748b" : "#94a3b8";
  const rowColor = surface === "light" ? "#0f172a" : "#e2e8f0";
  const colors = TONE_COLORS[surface];
  const fontSize = compact ? 12 : 13;
  const cellPadding = compact ? "6px 8px" : "8px 10px";

  return (
    <div style={style}>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize,
          }}
        >
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  style={{
                    textAlign: column.align ?? "left",
                    color: headerColor,
                    fontWeight: 600,
                    padding: cellPadding,
                    borderBottom: `1px solid ${borderColor}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => {
                  const tone = cellTone(row, column);
                  const value = row[column.key];
                  return (
                    <td
                      key={column.key}
                      style={{
                        textAlign: column.align ?? "left",
                        color: tone ? colors[tone] : rowColor,
                        padding: cellPadding,
                        borderBottom: `1px solid ${borderColor}`,
                        fontFamily: column.monospace
                          ? "ui-monospace, SFMono-Regular, Menlo, monospace"
                          : undefined,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {value == null ? "" : String(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? (
        <p
          style={{
            marginTop: 6,
            marginBottom: 0,
            fontSize: 11,
            color: headerColor,
          }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  );
}
