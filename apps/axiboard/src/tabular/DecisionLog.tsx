import type { ReactElement } from "react";
import type { AgentDecision } from "../../server/types";

export function DecisionLog({ decisions }: { decisions: AgentDecision[] }): ReactElement | null {
  if (decisions.length === 0) return null;

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
