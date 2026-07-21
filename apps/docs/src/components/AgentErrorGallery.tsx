import type { ReactElement } from "react";
import { AGENT_ERROR_GALLERY } from "../data/agentErrorGallery";
import { docCardStyle } from "../styles/docTokens";

export function AgentErrorGallery(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {AGENT_ERROR_GALLERY.map((ex) => (
        <div key={ex.code} style={{ ...docCardStyle(), padding: 16, boxShadow: "none" }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
            <code>{ex.code}</code>
            <span style={{ fontWeight: 400, color: "#64748b", marginLeft: 8 }}>{ex.family}</span>
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b" }}>{ex.note}</p>
          <pre
            style={{
              margin: "0 0 8px",
              padding: 10,
              background: "#fef2f2",
              borderRadius: 6,
              fontSize: 11,
              overflow: "auto",
            }}
          >
            {ex.bad}
          </pre>
          <pre
            style={{
              margin: 0,
              padding: 10,
              background: "#f0fdf4",
              borderRadius: 6,
              fontSize: 11,
              overflow: "auto",
            }}
          >
            {ex.fixed}
          </pre>
        </div>
      ))}
    </div>
  );
}
