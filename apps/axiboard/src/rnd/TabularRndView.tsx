import { useMemo, useState, type ChangeEvent, type ReactElement } from "react";
import { Chart, PanelSpecGrid, classifyTabularDomain } from "@axicharts/charts-spec";
import type { AgentDecision } from "../../server/types";
import { OrchestratorChat } from "../chat/OrchestratorChat";
import { useRndSession } from "../hooks/useOrchestratorPlan";
import { enrichForDisplay, formatDisplaySummary } from "./enrichForDisplay";
import { parseTabular } from "./parseTabular";
import { TABULAR_SAMPLES, type TabularSampleId } from "./tabularSamples";

const buttonStyle = {
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#e2e8f0",
  cursor: "pointer",
} as const;

const kpiStyle = {
  flex: "1 1 160px",
  padding: "14px 16px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#111827",
} as const;

export type TabularRndViewProps = {
  onExit: () => void;
};

function DomainConfidenceBanner({
  vertical,
  confidence,
  needsReview,
  signals,
}: {
  vertical: string;
  confidence: number;
  needsReview: boolean;
  signals: string[];
}): ReactElement | null {
  if (!needsReview) return null;

  return (
    <div
      style={{
        marginBottom: 16,
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #854d0e",
        background: "#422006",
        fontSize: 12,
        color: "#fde68a",
        lineHeight: 1.5,
      }}
    >
      <strong>Domain review:</strong> classified as <code>{vertical}</code> at{" "}
      {Math.round(confidence * 100)}% confidence.
      {signals.length > 0 ? (
        <>
          {" "}
          Signals: {signals.slice(0, 4).join(", ")}.
        </>
      ) : null}
    </div>
  );
}

function DecisionLog({ decisions }: { decisions: AgentDecision[] }): ReactElement {
  return (
    <div
      style={{
        marginBottom: 20,
        padding: 14,
        borderRadius: 10,
        border: "1px solid #334155",
        background: "#111827",
        fontSize: 11,
        color: "#94a3b8",
        lineHeight: 1.6,
      }}
    >
      <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>Agent decisions</div>
      <ol style={{ margin: 0, paddingLeft: 18 }}>
        {decisions.map((decision, index) => (
          <li
            key={`${decision.step}-${decision.api}-${decision.intent ?? index}-${index}`}
            style={{ marginBottom: 6 }}
          >
            <span style={{ color: "#e2e8f0" }}>{decision.step}</span>
            {" · "}
            <code>{decision.api}</code>
            {decision.intent ? (
              <>
                {" · "}
                <em>{decision.intent}</em>
              </>
            ) : null}
            {" — "}
            {decision.notes}
            {decision.status === "needs_review" ? (
              <span style={{ color: "#fbbf24" }}> (needs review)</span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function TabularRndView({ onExit }: TabularRndViewProps): ReactElement {
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    rawText,
    setRawText,
    hydrated,
    result: agentPlan,
    loading,
    error: orchestratorError,
    persona,
    setPersona,
    sendMessage,
  } = useRndSession({
    slug: "tabular",
    sampleCsv: "",
    initialFollowUpIntents: [],
  });

  const previewDomain = useMemo(() => {
    const rows = parseTabular(rawText);
    if (rows.length === 0) return null;
    return classifyTabularDomain({ rows });
  }, [rawText]);

  const display = useMemo(() => {
    const vertical = agentPlan?.vertical ?? previewDomain?.vertical;
    if (!vertical || vertical === "generic") return null;
    return enrichForDisplay(rawText, vertical);
  }, [rawText, agentPlan?.vertical, previewDomain?.vertical]);

  const domainView = agentPlan?.domain ?? previewDomain;

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setRawText(await file.text());
      setFileError(null);
    } catch (cause) {
      setFileError(cause instanceof Error ? cause.message : "Failed to read file");
    } finally {
      event.target.value = "";
    }
  };

  const loadSample = (id: TabularSampleId): void => {
    const sample = TABULAR_SAMPLES.find((entry) => entry.id === id);
    if (sample) setRawText(sample.csv);
  };

  const error = fileError ?? orchestratorError;
  const hasInput = rawText.trim().length > 0;

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
          <div style={{ fontSize: 16, fontWeight: 700 }}>R&D — Tabular CSV → dashboard</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, maxWidth: 640 }}>
            Upload any business table — <code>classifyTabularDomain</code> picks the vertical, then{" "}
            <code>planDashboardFromRows</code> via <code>/api/orchestrator/chat</code>.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <label style={buttonStyle}>
            Upload CSV
            <input
              type="file"
              accept=".csv,.tsv,.txt,text/csv,text/plain"
              hidden
              onChange={onFile}
            />
          </label>
          {TABULAR_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => loadSample(sample.id)}
              style={buttonStyle}
              title={sample.hint}
            >
              {sample.label}
            </button>
          ))}
          <button type="button" onClick={onExit} style={buttonStyle}>
            Back to workspace
          </button>
        </div>
      </div>

      {domainView && hasInput ? (
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px" }}>
          Detected domain: <code>{domainView.vertical}</code>
          {domainView.needsReview ? (
            <span style={{ color: "#fbbf24" }}>
              {" "}
              · {Math.round(domainView.confidence * 100)}% confidence (review)
            </span>
          ) : (
            <span> · {Math.round(domainView.confidence * 100)}% confidence</span>
          )}
        </p>
      ) : null}

      <OrchestratorChat
        persona={persona}
        onPersonaChange={setPersona}
        onSend={sendMessage}
        loading={loading}
        assistantMessage={agentPlan?.assistantMessage}
        llmUsed={agentPlan?.llm.used}
        placeholder="Ask agent… e.g. show breakdown by category"
      />

      {error ? (
        <div style={{ marginBottom: 12, fontSize: 12, color: "#f87171" }}>{error}</div>
      ) : null}

      {!hasInput || !hydrated ? (
        <p style={{ fontSize: 13, color: "#94a3b8" }}>
          Upload a CSV or pick a sample dataset — no vertical picker required.
        </p>
      ) : !agentPlan || loading ? (
        <p style={{ fontSize: 13, color: "#94a3b8" }}>
          {loading ? "Planning dashboard…" : "Waiting for planner…"}
        </p>
      ) : (
        <>
          {domainView ? (
            <DomainConfidenceBanner
              vertical={domainView.vertical}
              confidence={domainView.confidence}
              needsReview={domainView.needsReview}
              signals={domainView.signals}
            />
          ) : null}

          <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px" }}>
            {display ? `${formatDisplaySummary(display)} · ` : ""}
            agent feed <code>{agentPlan.dashboardPlan.feed}</code> · template{" "}
            <code>{agentPlan.dashboardPlan.template}</code> · vertical{" "}
            <code>{agentPlan.vertical}</code>
          </p>

          <DecisionLog decisions={agentPlan.decisions} />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            {agentPlan.kpis.map((block) => (
              <div key={block.panel.title} style={{ ...kpiStyle, minWidth: 140 }}>
                <Chart panel={block.panel} data={{ rows: block.rows }} height={72} />
              </div>
            ))}
          </div>

          <PanelSpecGrid
            panels={agentPlan.charts.map((block) => ({
              panel: block.panel,
              data: { rows: block.rows },
              title: block.panel.title,
            }))}
          />
        </>
      )}

      <details style={{ marginTop: 24 }}>
        <summary style={{ fontSize: 12, color: "#94a3b8", cursor: "pointer" }}>
          Raw input (R&D)
        </summary>
        <textarea
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          spellCheck={false}
          placeholder="Paste tabular data or use Upload CSV above…"
          style={{
            marginTop: 8,
            width: "100%",
            minHeight: 160,
            boxSizing: "border-box",
            padding: 12,
            borderRadius: 8,
            background: "#020617",
            border: "1px solid #334155",
            color: "#e2e8f0",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            lineHeight: 1.5,
          }}
        />
      </details>
    </div>
  );
}
