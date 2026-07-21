"use client";

import type { ReactElement } from "react";
import { Chart } from "@axicharts/charts-spec";
import { validatePanel } from "@axicharts/charts-spec/planning";
import { KpiFlipCard } from "./KpiFlipCard";
import type { PanelsDashboardSpec } from "./types";
import type { TabularPanelBlock } from "./types";

export type PanelsDashboardProps = {
  panels: PanelsDashboardSpec;
  className?: string;
  /** Flip KPI cards to show agent rationale (default true). */
  flipKpis?: boolean;
  /**
   * When true, chart panels must pass `validate_panel` in strict mode before render.
   * KPI stat panels and tables are skipped (Tier-2 widgets).
   */
  agentValidated?: boolean;
  /** Highlight panels added via chat refinement (C181). */
  highlightQuestionIds?: string[];
};

function AgentValidationError({
  title,
  message,
}: {
  title?: string;
  message: string;
}): ReactElement {
  return (
    <div
      role="alert"
      style={{
        padding: 12,
        borderRadius: 8,
        border: "1px solid #fecaca",
        background: "#fef2f2",
        color: "#991b1b",
        fontSize: 12,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {title ? <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div> : null}
      <div>{message}</div>
    </div>
  );
}

function validateAgentChartBlock(block: TabularPanelBlock): string | null {
  const result = validatePanel(block.panel, {
    rows: block.rows,
    strict: true,
  });
  if (result.ok) return null;
  const first = result.errors[0];
  return first?.message ?? "Panel failed agent validation";
}

function ChartTile({
  block,
  height,
  agentValidated,
  highlighted,
}: {
  block: TabularPanelBlock;
  height: number;
  agentValidated: boolean;
  highlighted?: boolean;
}): ReactElement {
  if (agentValidated) {
    const error = validateAgentChartBlock(block);
    if (error) {
      return <AgentValidationError title={block.panel.title} message={error} />;
    }
  }
  return (
    <div
      data-question-id={block.questionId}
      className={highlighted ? "axi-panel-highlight" : undefined}
      style={{ minWidth: 0, height: "100%" }}
    >
      <Chart panel={block.panel} data={{ rows: block.rows }} height={height} />
    </div>
  );
}

export function PanelsDashboard({
  panels,
  className,
  flipKpis = true,
  agentValidated = false,
  highlightQuestionIds = [],
}: PanelsDashboardProps): ReactElement {
  const columns = panels.columns ?? 2;
  const gap = panels.gap ?? 16;
  const pinTableBottom = panels.layoutVariant === "table-pinned-bottom";
  const highlightSet = new Set(highlightQuestionIds);

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
            <div key={block.questionId ?? block.panel.title} style={{ minWidth: 0 }}>
              <ChartTile
                block={block}
                height={280}
                agentValidated={agentValidated}
                highlighted={Boolean(block.questionId && highlightSet.has(block.questionId))}
              />
            </div>
          ))}
        </div>
      ) : null}

      {tableBlocks.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap, width: "100%" }}>
          {tableBlocks.map((block) => (
            <div
              key={block.questionId ?? block.panel.title}
              data-question-id={block.questionId}
              className={
                block.questionId && highlightSet.has(block.questionId)
                  ? "axi-panel-highlight"
                  : undefined
              }
              style={{ minWidth: 0 }}
            >
              <Chart panel={block.panel} data={{ rows: block.rows }} height={320} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
