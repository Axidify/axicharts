import { useState, type FormEvent, type ReactElement } from "react";
import type { Persona } from "@axicharts/charts-spec";
import { PersonaSelect } from "../rnd/PersonaSelect";
import { ByokSettings } from "./ByokSettings";

const buttonStyle = {
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#e2e8f0",
  cursor: "pointer",
} as const;

export type OrchestratorChatProps = {
  persona: Persona;
  onPersonaChange: (persona: Persona) => void;
  onSend: (message: string) => Promise<void>;
  loading?: boolean;
  assistantMessage?: string | null;
  llmUsed?: boolean;
  placeholder?: string;
};

export function OrchestratorChat({
  persona,
  onPersonaChange,
  onSend,
  loading = false,
  assistantMessage,
  llmUsed,
  placeholder = "Ask about this data… e.g. show payment method breakdown",
}: OrchestratorChatProps): ReactElement {
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || loading) return;
    await onSend(trimmed);
    setMessage("");
  };

  return (
    <div>
      <ByokSettings />
      <form
        style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}
        onSubmit={onSubmit}
      >
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={placeholder}
          disabled={loading}
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
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Planning…" : "Ask agent"}
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
