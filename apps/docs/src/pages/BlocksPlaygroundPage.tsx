import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { BlocksPlayground } from "@axicharts/charts-spec";

export function BlocksPlaygroundPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Blocks Playground</h1>
      <p style={{ color: "#475569", maxWidth: 720, lineHeight: 1.6 }}>
        C138 — edit cartesian <code>marks[]</code> JSON, see validation errors before render, preview
        the chart, and copy ejected composable JSX. Presets are canonical few-shot examples for
        agents and planners. See also{" "}
        <Link to="/spec">Spec layer</Link> and the agent skill in{" "}
        <code>packages/charts-spec/agent-skills/cartesian/SKILL.md</code>.
      </p>
      <BlocksPlayground />
    </div>
  );
}
