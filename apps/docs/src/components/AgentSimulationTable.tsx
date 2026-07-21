import type { ReactElement } from "react";
import { getAgentSimulationSummaries } from "@axicharts/charts-spec";
import { docBodyStyle } from "../styles/docTokens";

export function AgentSimulationTable(): ReactElement {
  const summaries = getAgentSimulationSummaries();

  return (
    <div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
          marginBottom: 12,
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
            <th style={{ padding: "8px 10px" }}>Family</th>
            <th style={{ padding: "8px 10px" }}>Scenarios</th>
            <th style={{ padding: "8px 10px" }}>works</th>
            <th style={{ padding: "8px 10px" }}>throws</th>
            <th style={{ padding: "8px 10px" }}>silent_bad</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((row) => (
            <tr key={row.family} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 10px" }}>
                <code>{row.family}</code>
              </td>
              <td style={{ padding: "8px 10px" }}>{row.scenarios}</td>
              <td style={{ padding: "8px 10px" }}>{row.works}</td>
              <td style={{ padding: "8px 10px" }}>{row.throws}</td>
              <td style={{ padding: "8px 10px", fontWeight: row.silent_bad === 0 ? 600 : 700, color: row.silent_bad === 0 ? "#15803d" : "#b91c1c" }}>
                {row.silent_bad}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ ...docBodyStyle(), fontSize: 12, color: "#64748b", margin: 0 }}>
        Regenerate:{" "}
        <code>pnpm --filter @axicharts/charts-spec test compositionSimulation distributionSimulation matrixSimulation</code>
      </p>
    </div>
  );
}
