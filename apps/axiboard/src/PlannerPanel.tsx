import { useEffect, useState, type ReactElement } from "react";
import {
  DEFAULT_OPS_PROFILE,
  fetchPlannerHealth,
  requestDashboardPlan,
  type DashboardPlan,
  type PlannerHealth,
} from "@axicharts/charts-planner";
import {
  axiboardImportDeepLink,
  docsImportGalleryDeepLink,
  formatValidatePresetCommand,
  plannerAdapterFixtures,
  plannerFeedGalleryDeepLink,
} from "@axicharts/charts-runtime/validation";
import { ValidateCommandCopy } from "./validationChrome";

const QUICK_INTENTS = [
  "Line 3 night shift overview",
  "Finance P&L board",
  "Mock-live synthetic demo drift",
  "REST API polling line metrics",
  "WebSocket push trading desk",
  "MQTT plant floor telemetry",
  "Program sprint burndown",
  "Trading desk program mosaic",
] as const;

const overlayStyle = {
  position: "fixed" as const,
  inset: 0,
  zIndex: 60,
  background: "rgba(2, 6, 23, 0.72)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const panelStyle = {
  width: "min(560px, 100%)",
  maxHeight: "min(720px, 100%)",
  overflow: "auto",
  background: "#0f172a",
  color: "#e2e8f0",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: 20,
};

const buttonStyle = {
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#e2e8f0",
  cursor: "pointer",
} as const;

export type PlannerPanelProps = {
  open: boolean;
  serverUrl?: string;
  onClose: () => void;
  onApply: (plan: DashboardPlan) => void;
};

function sourceLabel(plan: DashboardPlan | null): string {
  if (!plan) return "—";
  switch (plan.source) {
    case "llm":
      return "LLM";
    case "intent":
      return "Intent rules";
    default:
      return "Profile rules";
  }
}

export function PlannerPanel({
  open,
  serverUrl,
  onClose,
  onApply,
}: PlannerPanelProps): ReactElement | null {
  const [intent, setIntent] = useState("Line 3 night shift overview");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<DashboardPlan | null>(null);
  const [health, setHealth] = useState<PlannerHealth | null>(null);

  useEffect(() => {
    if (!open) return;
    setPlan(null);
    if (!serverUrl) {
      setHealth(null);
      return;
    }
    void fetchPlannerHealth(serverUrl)
      .then(setHealth)
      .catch(() => setHealth({ ok: false }));
  }, [open, serverUrl]);

  if (!open) return null;

  const runPlan = async (): Promise<void> => {
    setLoading(true);
    try {
      const next = await requestDashboardPlan({
        profile: { metrics: [...DEFAULT_OPS_PROFILE.metrics] },
        intent,
        serverUrl,
      });
      setPlan(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle} role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-labelledby="planner-title"
        style={panelStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div id="planner-title" style={{ fontSize: 16, fontWeight: 700 }}>
              Plan dashboard
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              {serverUrl
                ? health?.ok
                  ? `Server connected · ${health.provider ?? "rules"}`
                  : "Server unreachable — will fall back to local rules"
                : "Local rules planner"}
            </div>
          </div>
          <button type="button" onClick={onClose} style={buttonStyle}>
            Close
          </button>
        </div>

        <label style={{ display: "block", marginTop: 16, fontSize: 12 }}>
          Intent
          <textarea
            value={intent}
            onChange={(event) => setIntent(event.target.value)}
            rows={4}
            style={{
              display: "block",
              width: "100%",
              marginTop: 6,
              padding: 10,
              borderRadius: 8,
              border: "1px solid #475569",
              background: "#020617",
              color: "#e2e8f0",
              fontSize: 13,
              resize: "vertical",
            }}
          />
        </label>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {QUICK_INTENTS.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => setIntent(sample)}
              style={{
                ...buttonStyle,
                fontSize: 11,
                padding: "4px 8px",
              }}
            >
              {sample}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            type="button"
            onClick={() => void runPlan()}
            disabled={loading || !intent.trim()}
            style={buttonStyle}
          >
            {loading ? "Planning…" : "Generate plan"}
          </button>
        </div>

        {plan ? (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#020617",
              fontSize: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <strong>{plan.title ?? plan.template}</strong>
              <span style={{ color: "#94a3b8" }}>{sourceLabel(plan)}</span>
            </div>
            {plan.subtitle ? (
              <div style={{ color: "#94a3b8", marginTop: 4 }}>{plan.subtitle}</div>
            ) : null}
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "96px 1fr",
                gap: "6px 12px",
                margin: "12px 0 0",
              }}
            >
              <dt style={{ color: "#94a3b8" }}>Template</dt>
              <dd style={{ margin: 0 }}>{plan.template}</dd>
              <dt style={{ color: "#94a3b8" }}>Layout</dt>
              <dd style={{ margin: 0 }}>{plan.layout}</dd>
              {plan.layout === "mosaic" && plan.mosaicPreset ? (
                <>
                  <dt style={{ color: "#94a3b8" }}>Mosaic preset</dt>
                  <dd style={{ margin: 0 }}>{plan.mosaicPreset}</dd>
                </>
              ) : null}
              <dt style={{ color: "#94a3b8" }}>Feed</dt>
              <dd style={{ margin: 0 }}>{plan.feed}</dd>
              <dt style={{ color: "#94a3b8" }}>Presentation</dt>
              <dd style={{ margin: 0 }}>{plan.presentation ? "Yes" : "No"}</dd>
              <dt style={{ color: "#94a3b8" }}>Panels</dt>
              <dd style={{ margin: 0 }}>{plan.panels.length}</dd>
            </dl>
            {plan.warnings?.length ? (
              <ul style={{ margin: "12px 0 0", paddingLeft: 18, color: "#fbbf24" }}>
                {plan.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
            {(() => {
              const fixtures = plannerAdapterFixtures({
                layout: plan.layout,
                feed: plan.feed,
              });
              if (fixtures.length === 0) return null;
              return (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #334155",
                    background: "#111827",
                    fontSize: 12,
                    color: "#94a3b8",
                    lineHeight: 1.7,
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>
                    {fixtures.length > 1 ? "Adapter fixtures" : "Adapter fixture"}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {fixtures.map(({ preset, role }) => (
                      <li key={`${preset.id}:${role}`} style={{ marginBottom: 6 }}>
                        <strong style={{ color: "#e2e8f0" }}>{preset.label}</strong>
                        {" · "}
                        <span>{role}</span>
                        {preset.adapter ? (
                          <>
                            {" "}
                            (<code>{preset.adapter}</code>)
                          </>
                        ) : null}
                        {" · "}
                        <a
                          href={docsImportGalleryDeepLink(preset.id)}
                          style={{ color: "#93c5fd" }}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Gallery
                        </a>
                        {" · "}
                        <a
                          href={axiboardImportDeepLink(preset.id)}
                          style={{ color: "#93c5fd" }}
                        >
                          Import
                        </a>
                        <ValidateCommandCopy command={formatValidatePresetCommand(preset.id)} />
                      </li>
                    ))}
                  </ul>
                  <p style={{ margin: "10px 0 0", fontSize: 11, color: "#64748b" }}>
                    Planner feed index:{" "}
                    <a
                      href={plannerFeedGalleryDeepLink(plan.feed)}
                      style={{ color: "#93c5fd" }}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Gallery table
                    </a>
                    {" · "}
                    <a
                      href="https://axidify.github.io/axicharts/runtime#planner-http"
                      style={{ color: "#93c5fd" }}
                      target="_blank"
                      rel="noreferrer"
                    >
                      HTTP API
                    </a>
                  </p>
                </div>
              );
            })()}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => {
                  onApply(plan);
                  onClose();
                }}
                style={buttonStyle}
              >
                Apply to builder
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
