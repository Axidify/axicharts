import type { ReactElement } from "react";
import type { AgentDecision } from "../../server/types";

export type DecisionLogProps = {
  decisions: AgentDecision[];
  defaultCollapsed?: boolean;
};

export function DecisionLog({
  decisions,
  defaultCollapsed = true,
}: DecisionLogProps): ReactElement | null {
  if (decisions.length === 0) return null;

  return (
    <details className="axi-decision-log" open={!defaultCollapsed}>
      <summary>How this was built ({decisions.length} steps)</summary>
      <ol>
        {decisions.map((decision, index) => (
          <li
            key={`${decision.step}-${decision.api}-${decision.intent ?? index}-${index}`}
            style={{ marginBottom: 6 }}
          >
            <span style={{ color: "#ececec" }}>{decision.step}</span>
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
    </details>
  );
}
