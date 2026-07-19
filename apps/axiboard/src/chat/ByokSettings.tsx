import { useState, type FormEvent, type ReactElement } from "react";
import { saveByokSession } from "../api/orchestratorClient";

const panelStyle = {
  marginBottom: 16,
  padding: 12,
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#0f172a",
} as const;

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #475569",
  background: "#020617",
  color: "#e2e8f0",
  fontSize: 12,
};

export function ByokSettings(): ReactElement {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [baseUrl, setBaseUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    try {
      const sessionId = await saveByokSession({
        apiKey,
        model: model || undefined,
        baseUrl: baseUrl || undefined,
      });
      setStatus(`Session saved (${sessionId.slice(0, 8)}…). Key stays server-side.`);
      setApiKey("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to save BYOK session");
    }
  };

  return (
    <div style={panelStyle}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          fontSize: 12,
          padding: 0,
          border: "none",
          background: "transparent",
          color: "#94a3b8",
          cursor: "pointer",
        }}
      >
        {open ? "▾" : "▸"} BYOK — LLM API key (optional)
      </button>
      {open ? (
        <form onSubmit={onSubmit} style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
            OpenAI-compatible key for chat intent parsing. Stored in server session only — not in
            the browser after save.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="sk-…"
            style={inputStyle}
            autoComplete="off"
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Model"
              style={{ ...inputStyle, flex: "1 1 160px" }}
            />
            <input
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="Base URL (optional)"
              style={{ ...inputStyle, flex: "2 1 240px" }}
            />
          </div>
          <button
            type="submit"
            disabled={!apiKey.trim()}
            style={{
              fontSize: 12,
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #475569",
              background: "#1e293b",
              color: "#e2e8f0",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            Save BYOK session
          </button>
          {status ? <div style={{ fontSize: 11, color: "#86efac" }}>{status}</div> : null}
          {error ? <div style={{ fontSize: 11, color: "#f87171" }}>{error}</div> : null}
        </form>
      ) : null}
    </div>
  );
}
