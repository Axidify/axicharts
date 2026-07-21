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
  zebra?: boolean;
  stickyHeader?: boolean;
  maxHeight?: number;
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
  const label = String(
    column.toneKey === column.key ? row[column.key] : tone ?? "",
  );
  const lower = label.toLowerCase();
  if (lower.includes("warn")) return "warning";
  if (
    lower.includes("critical") ||
    lower.includes("error") ||
    lower.includes("offline")
  ) {
    return "critical";
  }
  return undefined;
}

export function DataTable({
  columns,
  rows,
  surface = "dark",
  compact = false,
  zebra = true,
  stickyHeader = false,
  maxHeight,
  caption,
  style,
}: DataTableProps): ReactElement {
  const borderColor = surface === "light" ? "#e2e8f0" : "#334155";
  const headerBg = surface === "light" ? "#f8fafc" : "#1e293b";
  const headerColor = surface === "light" ? "#64748b" : "#94a3b8";
  const rowColor = surface === "light" ? "#0f172a" : "#e2e8f0";
  const zebraBg = surface === "light" ? "#f8fafc" : "rgba(30, 41, 59, 0.45)";
  const colors = TONE_COLORS[surface];
  const fontSize = compact ? 11 : 13;
  const cellPadding = compact ? "5px 8px" : "8px 10px";

  const table = (
    <table
      style={{
        width: "100%",
        tableLayout: "fixed",
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
                position: stickyHeader ? "sticky" : undefined,
                top: stickyHeader ? 0 : undefined,
                zIndex: stickyHeader ? 1 : undefined,
                textAlign: column.align ?? "left",
                color: headerColor,
                fontWeight: 600,
                padding: cellPadding,
                borderBottom: `1px solid ${borderColor}`,
                background: headerBg,
                overflow: "hidden",
                textOverflow: "ellipsis",
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
          <tr
            key={rowIndex}
            style={
              zebra && rowIndex % 2 === 1
                ? { background: zebraBg }
                : undefined
            }
          >
            {columns.map((column) => {
              const tone = cellTone(row, column);
              const value = row[column.key];
              const numeric = column.align === "right" || column.monospace;
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
                    fontVariantNumeric: numeric ? "tabular-nums" : undefined,
                    maxWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
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
  );

  return (
    <div style={style}>
      <div
        style={{
          overflowX: "auto",
          overflowY: stickyHeader && maxHeight ? "auto" : undefined,
          maxHeight: stickyHeader && maxHeight ? maxHeight : undefined,
        }}
      >
        {table}
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
