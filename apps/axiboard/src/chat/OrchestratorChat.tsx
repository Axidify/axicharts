import { useState, type FormEvent, type KeyboardEvent, type ReactElement } from "react";
import type { Persona } from "@axicharts/charts-spec";
import { PersonaSelect } from "../tabular/PersonaSelect";
import { ByokSettings } from "./ByokSettings";
import { SendIcon } from "./DashboardSkeleton";

const PERSONAS: { id: Persona; label: string }[] = [
  { id: "executive", label: "Executive" },
  { id: "manager", label: "Manager" },
  { id: "analyst", label: "Analyst" },
  { id: "operator", label: "Operator" },
];

const legacyButtonStyle = {
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#e2e8f0",
  cursor: "pointer",
} as const;

const legacyInputStyle = {
  flex: "1 1 280px",
  minWidth: 220,
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #475569",
  background: "#0f172a",
  color: "#e2e8f0",
  fontSize: 12,
  fontFamily: "inherit",
  resize: "vertical" as const,
};

export type OrchestratorChatProps = {
  persona: Persona;
  onPersonaChange: (persona: Persona) => void;
  onSend: (message: string) => Promise<void>;
  loading?: boolean;
  assistantMessage?: string | null;
  llmUsed?: boolean;
  placeholder?: string;
  /** Chat workspace uses the modern composer; upload views use legacy single-line. */
  multiline?: boolean;
};

export function OrchestratorChat({
  persona,
  onPersonaChange,
  onSend,
  loading = false,
  assistantMessage,
  llmUsed,
  placeholder = "Ask about this data…",
  multiline = false,
}: OrchestratorChatProps): ReactElement {
  const [message, setMessage] = useState("");

  const submit = async () => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;
    await onSend(trimmed);
    setMessage("");
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await submit();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  if (!multiline) {
    return (
      <div>
        <ByokSettings />
        <form
          style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "flex-end" }}
          onSubmit={onSubmit}
        >
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={placeholder}
            disabled={loading}
            style={legacyInputStyle}
          />
          <button type="submit" style={legacyButtonStyle} disabled={loading}>
            {loading ? "Planning…" : "Send"}
          </button>
          <PersonaSelect value={persona} onChange={onPersonaChange} />
        </form>
        {assistantMessage ? (
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>
            {assistantMessage}
            {llmUsed ? <span style={{ color: "#86efac" }}> · LLM</span> : <span> · rules</span>}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="axi-composer-wrap">
      <ByokSettings compact />
      <form className="axi-composer" onSubmit={onSubmit}>
        <textarea
          className="axi-composer-input"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={loading}
          rows={1}
          aria-label="Message"
        />
        <div className="axi-composer-toolbar">
          <div className="axi-composer-tools">
            <select
              className="axi-persona-select"
              value={persona}
              onChange={(event) => onPersonaChange(event.target.value as Persona)}
              aria-label="Audience"
            >
              {PERSONAS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="axi-composer-send"
            disabled={loading || !message.trim()}
            aria-label={loading ? "Planning" : "Send message"}
          >
            <SendIcon />
          </button>
        </div>
      </form>
    </div>
  );
}
