import { useMemo, useState, type ChangeEvent, type ReactElement } from "react";
import { Chart, PanelSpecGrid } from "@axicharts/charts-spec";
import { agentPlanLedgerDashboard } from "./agentPlan";
import { enrichLedger, formatRm } from "./ledgerEnrich";
import { parseTabular } from "./parseTabular";
import { SAMPLE_LEDGER_TEXT } from "./sampleLedger";

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

export type LedgerRndViewProps = {
  onExit: () => void;
};

export function LedgerRndView({ onExit }: LedgerRndViewProps): ReactElement {
  const [rawText, setRawText] = useState(SAMPLE_LEDGER_TEXT);
  const [error, setError] = useState<string | null>(null);
  const [agentAsk, setAgentAsk] = useState("show payment method breakdown");
  const [followUpIntents, setFollowUpIntents] = useState<string[]>([
    "show payment method breakdown",
  ]);

  const enrichment = useMemo(() => {
    const rows = parseTabular(rawText);
    if (rows.length === 0) return null;
    return enrichLedger(rows);
  }, [rawText]);

  const agentPlan = useMemo(() => {
    if (!enrichment) return null;
    return agentPlanLedgerDashboard(enrichment, { followUpIntents });
  }, [enrichment, followUpIntents]);

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setRawText(await file.text());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to read file");
    } finally {
      event.target.value = "";
    }
  };

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
          <div style={{ fontSize: 16, fontWeight: 700 }}>R&D — Ledger → dashboard</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, maxWidth: 640 }}>
            Agent spike (RFC-003 / C148): <code>inferFieldRoles</code>,{" "}
            <code>aggregateRows</code>, <code>createCartesianPanel</code>,{" "}
            <code>planPanelFromMetric</code>, <code>PanelSpecGrid</code>.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label style={buttonStyle}>
            Upload CSV / TSV / pipe table
            <input
              type="file"
              accept=".csv,.tsv,.txt,text/csv,text/plain"
              hidden
              onChange={onFile}
            />
          </label>
          <button type="button" onClick={() => setRawText(SAMPLE_LEDGER_TEXT)} style={buttonStyle}>
            Load sample
          </button>
          <button type="button" onClick={onExit} style={buttonStyle}>
            Back to workspace
          </button>
        </div>
      </div>

      <form
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = agentAsk.trim();
          if (!trimmed) return;
          setFollowUpIntents((current) =>
            current.includes(trimmed) ? current : [...current, trimmed],
          );
        }}
      >
        <input
          value={agentAsk}
          onChange={(event) => setAgentAsk(event.target.value)}
          placeholder="Ask agent… e.g. show payment method breakdown"
          style={{
            flex: "1 1 280px",
            minWidth: 220,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #475569",
            background: "#0f172a",
            color: "#e2e8f0",
            fontSize: 12,
          }}
        />
        <button type="submit" style={buttonStyle}>
          Ask agent
        </button>
      </form>

      {error ? (
        <div style={{ marginBottom: 12, fontSize: 12, color: "#f87171" }}>{error}</div>
      ) : null}

      {!enrichment || !agentPlan ? (
        <p style={{ fontSize: 13, color: "#94a3b8" }}>
          Paste or upload a ledger table with Date, Debit, Credit, Balance, Category, and Cost
          Center columns.
        </p>
      ) : (
        <>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px" }}>
            {enrichment.kpis.transactionCount} transactions · agent feed{" "}
            <code>{agentPlan.dashboardPlan.feed}</code> · template{" "}
            <code>{agentPlan.dashboardPlan.template}</code> · net flow{" "}
            <span style={{ color: "#e2e8f0" }}>{formatRm(enrichment.kpis.netFlow)}</span>
          </p>

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
            <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>
              Agent decisions
            </div>
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {agentPlan.decisions.map((decision) => (
                <li key={`${decision.step}-${decision.api}`} style={{ marginBottom: 6 }}>
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
