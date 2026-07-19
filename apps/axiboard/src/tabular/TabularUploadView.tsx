import { useMemo, useState, type ChangeEvent, type ReactElement } from "react";
import { Chart, PanelSpecGrid, classifyTabularDomain, parseTabular, type Persona } from "@axicharts/charts-spec";
import type { OrchestratorChatResult } from "../api/orchestratorClient";
import { OrchestratorChat } from "../chat/OrchestratorChat";
import { useOrchestratorPlan } from "../hooks/useOrchestratorPlan";
import { DecisionLog } from "./DecisionLog";
import { DomainConfidenceBanner } from "./DomainConfidenceBanner";
import { enrichForDisplay, formatDisplaySummary } from "./enrichForDisplay";
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

export type TabularUploadViewProps = {
  onCancel: () => void;
  onApply: (
    plan: OrchestratorChatResult,
    rawText: string,
    persona: Persona,
    followUpIntents: string[],
  ) => void;
  initialCsv?: string;
  initialPersona?: Persona;
  initialFollowUpIntents?: string[];
};

export function TabularUploadView({
  onCancel,
  onApply,
  initialCsv = "",
  autoPlan = true,
  initialPersona,
  initialFollowUpIntents,
}: TabularUploadViewProps): ReactElement {
  const [rawText, setRawText] = useState(initialCsv);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    result: agentPlan,
    loading,
    error: orchestratorError,
    persona,
    setPersona,
    followUpIntents,
    sendMessage,
  } = useOrchestratorPlan({
    csv: rawText,
    initialPersona,
    initialFollowUpIntents,
    autoPlan: true,
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
          <div style={{ fontSize: 16, fontWeight: 700 }}>Upload CSV → dashboard</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, maxWidth: 640 }}>
            Upload any business table — domain is inferred automatically, then the orchestrator
            plans panels via <code>planDashboardFromRows</code>.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <label style={buttonStyle}>
            Choose file
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
          <button type="button" onClick={onCancel} style={buttonStyle}>
            Cancel
          </button>
          {agentPlan && !loading ? (
            <button
              type="button"
              style={{ ...buttonStyle, borderColor: "#22c55e", color: "#bbf7d0" }}
              onClick={() => onApply(agentPlan, rawText, persona, followUpIntents)}
            >
              Apply to dashboard
            </button>
          ) : null}
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

      {!hasInput ? (
        <p style={{ fontSize: 13, color: "#94a3b8" }}>
          Upload a CSV or pick a sample dataset to start planning.
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
            {agentPlan.dataProfile.grain ? (
              <>
                grain <code>{agentPlan.dataProfile.grain}</code>
                {agentPlan.dataProfile.timeSpan ? (
                  <>
                    {" "}
                    · {agentPlan.dataProfile.timeSpan.from}→{agentPlan.dataProfile.timeSpan.to}
                  </>
                ) : null}
                {" · "}
              </>
            ) : null}
            vertical <code>{agentPlan.vertical}</code>
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
    </div>
  );
}
