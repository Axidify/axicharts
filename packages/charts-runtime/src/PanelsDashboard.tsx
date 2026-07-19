"use client";

import type { ReactElement } from "react";
import { Chart } from "@axicharts/charts-spec";
import type { PanelsDashboardSpec } from "./types";

const kpiStyle = {
  flex: "1 1 160px",
  padding: "14px 16px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#111827",
} as const;

export type PanelsDashboardProps = {
  panels: PanelsDashboardSpec;
  className?: string;
};

export function PanelsDashboard({ panels, className }: PanelsDashboardProps): ReactElement {
  const columns = panels.columns ?? 2;
  const gap = panels.gap ?? 16;

  return (
    <div className={className} style={{ width: "100%" }}>
      {(panels.title || panels.subtitle) && (
        <div style={{ marginBottom: 20 }}>
          {panels.title ? (
            <div style={{ fontSize: 16, fontWeight: 700 }}>{panels.title}</div>
          ) : null}
          {panels.subtitle ? (
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{panels.subtitle}</div>
          ) : null}
          {panels.vertical ? (
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
              Tabular · <code>{panels.vertical}</code> · {panels.charts.length} chart
              {panels.charts.length === 1 ? "" : "s"}
            </div>
          ) : null}
        </div>
      )}

      {panels.kpis.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          {panels.kpis.map((block) => (
            <div key={block.panel.title} style={{ ...kpiStyle, minWidth: 140 }}>
              <Chart panel={block.panel} data={{ rows: block.rows }} height={72} />
            </div>
          ))}
        </div>
      ) : null}

      {panels.charts.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap,
            width: "100%",
          }}
        >
          {panels.charts.map((block) => (
            <div key={block.panel.title} style={{ minWidth: 0 }}>
              <Chart panel={block.panel} data={{ rows: block.rows }} height={280} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
