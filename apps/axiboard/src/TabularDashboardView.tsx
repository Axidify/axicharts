import { useEffect, useRef, type ReactElement } from "react";
import { PanelsDashboard, type PanelsDashboardSpec } from "@axicharts/charts-runtime";
import type { SavedDashboard } from "@axicharts/charts-runtime/workspace";
import type { OrchestratorChatResult } from "./api/orchestratorClient";
import { OrchestratorChat } from "./chat/OrchestratorChat";
import { DecisionLog } from "./tabular/DecisionLog";
import { useOrchestratorPlan } from "./hooks/useOrchestratorPlan";
import { buildTabularRuntimeSpec } from "./runtime/tabularRuntimeSpec";

const buttonStyle = {
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#e2e8f0",
  cursor: "pointer",
} as const;

export type TabularDashboardViewProps = {
  panels: PanelsDashboardSpec;
  meta?: SavedDashboard["meta"];
  onPlanUpdate: (spec: ReturnType<typeof buildTabularRuntimeSpec>, meta: SavedDashboard["meta"]) => void;
  onEditSource: () => void;
};

export function TabularDashboardView({
  panels,
  meta,
  onPlanUpdate,
  onEditSource,
}: TabularDashboardViewProps): ReactElement {
  const sourceCsv = panels.sourceCsv ?? "";

  const { persona, setPersona, sendMessage, loading, result, error } = useOrchestratorPlan({
    csv: sourceCsv,
    initialPersona: meta?.persona ?? "manager",
    initialFollowUpIntents: meta?.followUpIntents ?? [],
  });

  const lastAppliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!result) return;
    const fingerprint = `${result.followUpIntents.join("|")}:${result.charts.length}:${result.kpis.length}`;
    if (lastAppliedRef.current === fingerprint) return;
    lastAppliedRef.current = fingerprint;
    onPlanUpdate(buildTabularRuntimeSpec(result, sourceCsv), {
      layout: "panels",
      feed: "static",
      source: "tabular",
      persona: result.persona,
      followUpIntents: result.followUpIntents,
      vertical: result.vertical,
      dashboardIntent: result.dashboardIntent,
      presentation: meta?.presentation ?? false,
    });
  }, [result, sourceCsv, meta?.presentation, onPlanUpdate]);

  const viewSpec = result ? buildTabularRuntimeSpec(result, sourceCsv).panels : panels;
  const decisions = result?.decisions ?? panels.decisions ?? [];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {viewSpec.title ?? "Tabular dashboard"}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
            Agent-planned panels from uploaded CSV · saved in workspace
          </div>
        </div>
        <button type="button" onClick={onEditSource} style={buttonStyle}>
          Edit source data
        </button>
      </div>

      <OrchestratorChat
        persona={persona}
        onPersonaChange={setPersona}
        onSend={sendMessage}
        loading={loading}
        assistantMessage={result?.assistantMessage}
        llmUsed={result?.llm.used}
        placeholder="Ask agent… e.g. show breakdown by category"
      />

      {error ? (
        <div style={{ marginBottom: 12, fontSize: 12, color: "#f87171" }}>{error}</div>
      ) : null}

      <DecisionLog decisions={decisions} />

      <PanelsDashboard panels={viewSpec} agentValidated />
    </div>
  );
}
