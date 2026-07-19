import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { docBodyStyle, docCardStyle } from "../styles/docTokens";

const examples = [
  {
    code: "UNKNOWN_FIELD",
    bad: `{ "type": "cartesian", "encoding": { "x": { "field": "wek" } }, "marks": [{ "mark": "line", "field": "revenue" }] }`,
    fixed: `{ "encoding": { "x": { "field": "week" } } }`,
    note: "Validator suggests closest column name.",
  },
  {
    code: "MISSING_DATA_MARK",
    bad: `{ "type": "cartesian", "marks": [{ "mark": "rule", "value": 50 }] }`,
    fixed: `{ "marks": [{ "mark": "bar", "field": "revenue" }, { "mark": "rule", "value": 50 }] }`,
    note: "Overlays need at least one data mark (bar/line/area).",
  },
  {
    code: "INVALID_BAND_RANGE",
    bad: `{ "marks": [{ "mark": "band", "min": 80, "max": 20 }] }`,
    fixed: `{ "marks": [{ "mark": "band", "min": 20, "max": 80 }] }`,
    note: "Band min must be less than max.",
  },
] as const;

const TUTORIAL_CODE = `import { Chart, validateCartesianSpec, normalizeToCartesian } from "@axicharts/charts-spec";

const panel = normalizeToCartesian(agentOutput);
const check = validateCartesianSpec(panel, { rows: data });

if (!check.ok) {
  // Agent retries with check.errors — codes + field suggestions
  throw check.errors;
}

// Same render path as hand-built JSX
<Chart panel={check.spec ?? panel} data={data} />

// Pin to codebase when done:
// npx @axicharts/charts-spec eject panel.json`;

export function AgentCartesianGuidePage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Agent cartesian — validate → retry → eject</h1>
      <p style={docBodyStyle()}>
        5-minute loop for LLM/MCP agents emitting <code>type: &quot;cartesian&quot;</code> panels.
        Invalid specs fail <strong>before</strong> render — agents self-correct from structured errors.
      </p>

      <h2 style={{ fontSize: 16 }}>1. Validate before render</h2>
      <pre
        style={{
          padding: 14,
          borderRadius: 8,
          background: "#0f172a",
          color: "#e2e8f0",
          fontSize: 11,
          lineHeight: 1.5,
          overflow: "auto",
        }}
      >
        {TUTORIAL_CODE}
      </pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>2. Try in playground</h2>
      <p style={docBodyStyle()}>
        <Link to="/spec/blocks">Blocks Playground</Link> — edit JSON, see chart, eject JSX. Use{" "}
        <strong>Generate spec</strong> for agent eval fixtures.
      </p>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>3. Bad → fixed</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {examples.map((ex) => (
          <div key={ex.code} style={{ ...docCardStyle(), padding: 16, boxShadow: "none" }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
              <code>{ex.code}</code>
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

      <h2 style={{ fontSize: 16, marginTop: 28 }}>4. Eject to React</h2>
      <pre
        style={{
          padding: 14,
          borderRadius: 8,
          background: "#f1f5f9",
          fontSize: 12,
        }}
      >
        npx @axicharts/charts-spec eject panel.json
      </pre>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        Emits composable <code>CartesianChart</code> blocks by default — same tree agents compiled.
        Full reference:{" "}
        <a
          href="https://github.com/Axidify/axicharts/blob/main/packages/charts-spec/CARTESIAN.md"
          target="_blank"
          rel="noreferrer"
        >
          CARTESIAN.md
        </a>
        {" · "}
        <a
          href="https://github.com/Axidify/axiboard/blob/main/docs/charts/rfcs/RFC-002-cartesian-building-blocks.md"
          target="_blank"
          rel="noreferrer"
        >
          RFC-002
        </a>
      </p>

      <p style={{ ...docBodyStyle(), marginTop: 24, fontSize: 13 }}>
        Composition simulation: <strong>16 valid / 8 throw / 0 silent_bad</strong> — see{" "}
        <a
          href="https://github.com/Axidify/axiboard/blob/main/docs/charts/rfcs/RFC-002-composition-simulation.md"
          target="_blank"
          rel="noreferrer"
        >
          simulation report
        </a>
        .
      </p>
    </div>
  );
}
