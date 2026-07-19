"use client";

import type { ReactElement } from "react";
import { Chart } from "@axicharts/charts-spec";
import { KpiFlipCard } from "./KpiFlipCard";
import type { PanelsDashboardSpec } from "./types";

export type PanelsDashboardProps = {
  panels: PanelsDashboardSpec;
  className?: string;
  /** Flip KPI cards to show agent rationale (default true). */
  flipKpis?: boolean;
};

export function PanelsDashboard({
  panels,
  className,
  flipKpis = true,
}: PanelsDashboardProps): ReactElement {
  const columns = panels.columns ?? 2;
  const gap = panels.gap ?? 16;
  const pinTableBottom = panels.layoutVariant === "table-pinned-bottom";

  const chartBlocks = pinTableBottom
    ? panels.charts.filter((block) => block.panel.type !== "table")
    : panels.charts;
  const tableBlocks = pinTableBottom
    ? panels.charts.filter((block) => block.panel.type === "table")
    : [];

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
          {panels.kpis.map((block) => {
            const chart = (
              <Chart panel={block.panel} data={{ rows: block.rows }} height={72} />
            );
            if (!flipKpis) {
              return (
                <div key={block.questionId ?? block.panel.title} style={{ flex: "1 1 160px", minWidth: 140 }}>
                  {chart}
                </div>
              );
            }
            return (
              <KpiFlipCard
                key={block.questionId ?? block.panel.title}
                title={block.panel.title}
                questionId={block.questionId}
                rationale={block.rationale}
                intent={block.intent}
                decisions={panels.decisions}
              >
                {chart}
              </KpiFlipCard>
            );
          })}
        </div>
      ) : null}

      {chartBlocks.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap,
            width: "100%",
            marginBottom: tableBlocks.length > 0 ? gap : 0,
          }}
        >
          {chartBlocks.map((block) => (
            <div key={block.panel.title} style={{ minWidth: 0 }}>
              <Chart panel={block.panel} data={{ rows: block.rows }} height={280} />
            </div>
          ))}
        </div>
      ) : null}

      {tableBlocks.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap, width: "100%" }}>
          {tableBlocks.map((block) => (
            <div key={block.panel.title} style={{ minWidth: 0 }}>
              <Chart panel={block.panel} data={{ rows: block.rows }} height={320} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
