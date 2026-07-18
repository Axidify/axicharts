"use client";

import type { ReactElement } from "react";
import { buildChartA11yTable } from "./a11yTable";
import type { ChartA11yDescriptor } from "./types";

const SR_ONLY_STYLE = {
  position: "absolute" as const,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap" as const,
  border: 0,
};

export type ChartA11yFallbackProps = {
  descriptor: ChartA11yDescriptor;
};

/**
 * Screen-reader data table fallback for canvas-based charts.
 */
export function ChartA11yFallback({
  descriptor,
}: ChartA11yFallbackProps): ReactElement {
  const table = buildChartA11yTable(descriptor);

  return (
    <div style={SR_ONLY_STYLE} aria-hidden={false}>
      <table>
        {table.caption ? <caption>{table.caption}</caption> : null}
        <thead>
          <tr>
            {table.columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {table.columns.map((column) => (
                <td key={column.key}>{row[column.key] ?? ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
