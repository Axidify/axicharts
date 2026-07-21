import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { PanelsDashboard } from "@axicharts/charts-runtime";
import type { Persona } from "@axicharts/charts-spec";
import { extractTabularFromMessage } from "@axicharts/charts-spec/planning";
import type { OrchestratorChatResult } from "../api/orchestratorClient";
import { useOrchestratorPlan } from "../hooks/useOrchestratorPlan";
import { buildTabularRuntimeSpec } from "../runtime/tabularRuntimeSpec";
import { DecisionLog } from "../tabular/DecisionLog";
import { SAMPLE_INVENTORY_TEXT } from "../tabular/sampleInventory";
import { SAMPLE_LEDGER_TEXT } from "../tabular/sampleLedger";
import { SAMPLE_PROJECT_TASKS_TEXT } from "../tabular/sampleProjectTasks";
import { SAMPLE_SUPPORT_CASES_TEXT } from "../tabular/sampleSupportCases";
import { SAMPLE_DEVICE_TELEMETRY_TEXT } from "../tabular/sampleDeviceTelemetry";
import { TABULAR_SAMPLES } from "../tabular/tabularSamples";
import { ChatThread, type ChatMessage } from "./ChatThread";
import { ChatWelcome } from "./ChatWelcome";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { formatAssistantMeta, formatDashboardStatus } from "./formatAssistantMeta";
import { OrchestratorChat } from "./OrchestratorChat";
import { summarizeTabular } from "./summarizeTabular";
import "./chat-theme.css";

export type ChatWorkspaceViewProps = {
  onSave: (plan: OrchestratorChatResult, rawText: string, persona: Persona, followUpIntents: string[]) => void;
  initialCsv?: string;
  initialPersona?: Persona;
  initialFollowUpIntents?: string[];
};

export function ChatWorkspaceView({
  onSave,
  initialCsv = "",
  initialPersona,
  initialFollowUpIntents,
}: ChatWorkspaceViewProps): ReactElement {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [highlightQuestionIds, setHighlightQuestionIds] = useState<string[]>([]);
  const lastAssistantRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const artifactScrollRef = useRef<HTMLDivElement>(null);

  const {
    result,
    loading,
    error,
    persona,
    setPersona,
    followUpIntents,
    sessionCsv,
    sendMessage,
    resetSession,
  } = useOrchestratorPlan({
    csv: initialCsv,
    initialPersona,
    initialFollowUpIntents,
    autoPlan: false,
  });

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => [...current, message]);
  }, []);

  const handleSend = useCallback(
    async (rawMessage: string) => {
      const { text, tabular } = extractTabularFromMessage(rawMessage);
      const intent = text.trim() || (tabular ? "Build a dashboard for this data" : rawMessage.trim());
      appendMessage({
        id: `user-${Date.now()}`,
        role: "user",
        content: intent,
        tabularPreview: tabular ? summarizeTabular(tabular) : undefined,
      });

      await sendMessage(intent, tabular ?? undefined);
    },
    [appendMessage, sendMessage],
  );

  useEffect(() => {
    if (!result) return;
    const fingerprint = `${result.assistantMessage}:${result.kpis.length}:${result.charts.length}:${result.followUpIntents.join("|")}`;
    if (fingerprint === lastAssistantRef.current) return;
    lastAssistantRef.current = fingerprint;
    setMessages((current) => [
      ...current,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: result.assistantMessage,
        meta: formatAssistantMeta(result),
      },
    ]);
  }, [result]);

  useEffect(() => {
    const ids = result?.followUpQuestionIds ?? [];
    if (ids.length === 0) return;
    setHighlightQuestionIds(ids);
    const timer = window.setTimeout(() => {
      const root = artifactScrollRef.current;
      const target = root?.querySelector(`[data-question-id="${ids[0]}"]`);
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 120);
    const clearTimer = window.setTimeout(() => setHighlightQuestionIds([]), 6000);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(clearTimer);
    };
  }, [result?.followUpQuestionIds]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const panelsSpec = result ? buildTabularRuntimeSpec(result, sessionCsv).panels : null;

  const handleSuggestion = async (action: "paste-inventory" | "paste-ledger" | "paste-projects" | "paste-support" | "paste-telemetry" | "build" | "reorder") => {
    if (action === "paste-inventory") {
      await handleSend(`${SAMPLE_INVENTORY_TEXT}\n\nBuild a dashboard for this inventory`);
      return;
    }
    if (action === "paste-ledger") {
      await handleSend(`${SAMPLE_LEDGER_TEXT}\n\nBuild a dashboard for this ledger`);
      return;
    }
    if (action === "paste-telemetry") {
      await handleSend(`${SAMPLE_DEVICE_TELEMETRY_TEXT}\n\nBuild an IoT sensor dashboard`);
      return;
    }
    if (action === "paste-support") {
      await handleSend(`${SAMPLE_SUPPORT_CASES_TEXT}\n\nBuild a customer support dashboard`);
      return;
    }
    if (action === "paste-projects") {
      await handleSend(`${SAMPLE_PROJECT_TASKS_TEXT}\n\nBuild a project task dashboard`);
      return;
    }
    if (action === "build") {
      if (!sessionCsv.trim()) {
        await handleSend(`${SAMPLE_INVENTORY_TEXT}\n\nBuild a dashboard for this inventory`);
        return;
      }
      await handleSend("Build a dashboard for this data");
      return;
    }
    if (action === "reorder") {
      if (!sessionCsv.trim()) {
        await handleSend(`${SAMPLE_INVENTORY_TEXT}\n\nBuild a dashboard for this inventory`);
      }
      await handleSend("Which items are below reorder level?");
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave(result, sessionCsv, persona, followUpIntents);
    setSaveNotice("Saved to workspace");
    window.setTimeout(() => setSaveNotice(null), 4000);
  };

  const handleNewChat = () => {
    resetSession();
    setMessages([]);
    setSaveNotice(null);
    setHighlightQuestionIds([]);
    lastAssistantRef.current = null;
  };

  return (
    <div className="axi-chat-root">
      <div className="axi-chat-shell">
        <section className="axi-chat-pane" aria-label="Chat">
          <div className="axi-chat-scroll" ref={scrollRef}>
            {messages.length === 0 ? (
              <ChatWelcome onSuggestion={handleSuggestion} loading={loading} />
            ) : (
              <>
                <ChatThread messages={messages} />
                {loading ? (
                  <div className="axi-typing" aria-live="polite">
                    <div className="axi-avatar axi-avatar--assistant" aria-hidden>
                      A
                    </div>
                    <div style={{ paddingTop: 4 }}>
                      Planning dashboard
                      <span className="axi-typing-dots" aria-hidden>
                        <span />
                        <span />
                        <span />
                      </span>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="axi-chat-footer">
            {error ? <div className="axi-notice axi-notice--error">{error}</div> : null}
            {saveNotice ? <div className="axi-notice axi-notice--success">{saveNotice}</div> : null}

            <OrchestratorChat
              persona={persona}
              onPersonaChange={setPersona}
              onSend={handleSend}
              loading={loading}
              multiline
              placeholder="Paste a table or ask a question…"
            />

            <div className="axi-chat-footer-actions">
              <details>
                <summary className="axi-link-btn" style={{ listStyle: "none" }}>
                  More samples
                </summary>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {TABULAR_SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      className="axi-btn"
                      style={{ textAlign: "left" }}
                      onClick={() => {
                        void handleSend(`${sample.csv}\n\nBuild a dashboard`);
                      }}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </details>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button type="button" className="axi-link-btn" disabled={loading} onClick={handleNewChat}>
                  New chat
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="axi-artifact-pane" aria-label="Dashboard">
          <header className="axi-artifact-header">
            <div>
              <h2 className="axi-artifact-title">Dashboard</h2>
              <p className="axi-artifact-sub">
                {loading
                  ? "Building…"
                  : result
                    ? formatDashboardStatus(result)
                    : "Updates as you chat"}
              </p>
            </div>
            {result && !loading ? (
              <button type="button" className="axi-btn axi-btn--primary" onClick={handleSave}>
                Save
              </button>
            ) : null}
          </header>

          <div className="axi-artifact-scroll" ref={artifactScrollRef}>
            {loading ? <DashboardSkeleton /> : null}

            {!loading && result ? (
              <>
                <DecisionLog decisions={result.decisions} />
                <PanelsDashboard
                  panels={panelsSpec!}
                  agentValidated
                  highlightQuestionIds={highlightQuestionIds}
                />
              </>
            ) : null}

            {!loading && !result ? (
              <div className="axi-artifact-empty">
                <div className="axi-artifact-empty-icon" aria-hidden />
                <p>
                  Your charts and metrics will appear here.
                  <br />
                  Start with a sample on the left.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
