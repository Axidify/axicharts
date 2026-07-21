"use client";

import type { CSSProperties, ReactElement } from "react";
import { buildChartA11yTable } from "./a11yTable";
import type { ChartA11yDescriptor } from "./types";

export const SR_ONLY_STYLE: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export type ChartA11yTableViewProps = {
  descriptor: ChartA11yDescriptor;
  visible?: boolean;
  id?: string;
  className?: string;
};

export function ChartA11yTableView({
  descriptor,
  visible = false,
  id,
  className,
}: ChartA11yTableViewProps): ReactElement {
  const table = buildChartA11yTable(descriptor);

  return (
    <div
      id={id}
      className={className}
      style={visible ? VISIBLE_TABLE_WRAP_STYLE : SR_ONLY_STYLE}
      aria-hidden={visible ? undefined : false}
    >
      <table style={visible ? VISIBLE_TABLE_STYLE : undefined}>
        {table.caption ? <caption>{table.caption}</caption> : null}
        <thead>
          <tr>
            {table.columns.map((column) => (
              <th key={column.key} scope="col" style={visible ? thStyle(column.align) : undefined}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {table.columns.map((column) => (
                <td key={column.key} style={visible ? tdStyle(column.align) : undefined}>
                  {row[column.key] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const VISIBLE_TABLE_WRAP_STYLE: CSSProperties = {
  width: "100%",
  overflowX: "auto",
  marginBottom: 8,
};

const VISIBLE_TABLE_STYLE: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 12,
  lineHeight: 1.4,
};

function thStyle(align?: "left" | "right"): CSSProperties {
  return {
    textAlign: align ?? "left",
    padding: "6px 8px",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: 600,
    color: "#334155",
    background: "#f8fafc",
  };
}

function tdStyle(align?: "left" | "right"): CSSProperties {
  return {
    textAlign: align ?? "left",
    padding: "6px 8px",
    borderBottom: "1px solid #f1f5f9",
    color: "#475569",
  };
}
