import { useState, type FormEvent, type ReactElement } from "react";
import { saveByokSession } from "../api/orchestratorClient";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#171717",
  color: "#ececec",
  fontSize: 12,
};

export function ByokSettings({ compact = false }: { compact?: boolean }): ReactElement {
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
      setStatus(`Session saved (${sessionId.slice(0, 8)}…).`);
      setApiKey("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to save BYOK session");
    }
  };

  if (compact) {
    return (
      <details className="axi-byok-details">
        <summary>API key (optional)</summary>
        <form className="axi-byok-panel" onSubmit={onSubmit}>
          <p style={{ margin: "0 0 8px", fontSize: 11, color: "#737373", lineHeight: 1.5 }}>
            OpenAI-compatible key for richer intent parsing. Stored server-side only.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="sk-…"
            style={inputStyle}
            autoComplete="off"
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Model"
              style={{ ...inputStyle, flex: "1 1 140px" }}
            />
            <input
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="Base URL"
              style={{ ...inputStyle, flex: "2 1 200px" }}
            />
          </div>
          <button type="submit" className="axi-btn" disabled={!apiKey.trim()} style={{ marginTop: 10 }}>
            Save key
          </button>
          {status ? <div style={{ fontSize: 11, color: "#86efac", marginTop: 8 }}>{status}</div> : null}
          {error ? <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 8 }}>{error}</div> : null}
        </form>
      </details>
    );
  }

  return (
    <div
      style={{
        marginBottom: 16,
        padding: 12,
        borderRadius: 10,
        border: "1px solid #334155",
        background: "#0f172a",
      }}
    >
      <details>
        <summary style={{ fontSize: 12, color: "#94a3b8", cursor: "pointer" }}>
          BYOK — LLM API key (optional)
        </summary>
        <form onSubmit={onSubmit} style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="sk-…"
            style={inputStyle}
            autoComplete="off"
          />
          <button type="submit" className="axi-btn" disabled={!apiKey.trim()}>
            Save BYOK session
          </button>
          {status ? <div style={{ fontSize: 11, color: "#86efac" }}>{status}</div> : null}
          {error ? <div style={{ fontSize: 11, color: "#f87171" }}>{error}</div> : null}
        </form>
      </details>
    </div>
  );
}
