"use client";

import type { ReactElement } from "react";
import { Chart } from "./Chart";
import type { PanelSpec, SpecData } from "./types";

export type PanelSpecGridProps = {
  panels: Array<{
    panel: PanelSpec;
    data?: SpecData;
    title?: string;
  }>;
  /** Default row data when a panel omits `data`. */
  data?: SpecData;
  columns?: number;
  gap?: number;
  chartHeight?: number;
};

/**
 * C148e — render multiple PanelSpec cells from planner / agent output.
 */
export function PanelSpecGrid({
  panels,
  data,
  columns = 2,
  gap = 16,
  chartHeight = 240,
}: PanelSpecGridProps): ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${Math.max(280, Math.floor(640 / columns))}px, 1fr))`,
        gap,
      }}
    >
      {panels.map((block, index) => {
        const title = block.title ?? block.panel.title ?? `Panel ${index + 1}`;
        const panelData = block.data ?? data ?? { rows: [] };
        return (
          <section
            key={`${title}-${index}`}
            data-panel-title={title}
            style={{
              border: "1px solid var(--chart-grid-stroke, #334155)",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>{title}</h3>
            <Chart panel={block.panel} data={panelData} height={chartHeight} />
          </section>
        );
      })}
    </div>
  );
}
