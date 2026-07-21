import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { AgentErrorGallery } from "../components/AgentErrorGallery";
import { EjectWalkthrough } from "../components/EjectWalkthrough";
import { docBodyStyle } from "../styles/docTokens";

const MCP_TUTORIAL = `# Cursor / Claude Desktop (~/.cursor/mcp.json)
{
  "mcpServers": {
    "axicharts": {
      "command": "npx",
      "args": ["-y", "@axicharts/charts-mcp"]
    }
  }
}

# 1. Profile sample rows
describe_data_profile({ rows: sampleRows })

# 2. Draft cartesian panel (intent must name bar/line/area)
create_panel({
  family: "cartesian",
  intent: "weekly revenue bars with target line at 50",
  fields: ["week", "revenue", "target"]
})

# Or low-level cartesian + pre-aggregate raw rows:
execute_transform({
  rows: rawRows,
  groupBy: "status",
  aggregates: { count: { op: "count" } }
})
create_cartesian_panel({
  intent: "bar chart of count by status",
  rows: transformed.rows,
  groupBy: "status",
  aggregates: { count: { op: "count" } },
  xField: "status",
  yField: "count"
})

# 3. Validate (mandatory)
validate_panel({ spec: panel, rows: sampleRows, strict: true })

# 4. On error — apply fix patch, retry
# UNKNOWN_FIELD → errors[0].fix["marks[0].field"] = "revenue"

# 5. Render
import { Chart } from "@axicharts/charts-spec";
<Chart panel={validated.spec} data={rows} />

# 6. Pin when done
npx @axicharts/charts-spec eject panel.json`;

const SDK_TUTORIAL = `import {
  Chart,
  validatePanel,
  normalizeToCartesian,
} from "@axicharts/charts-spec";

const panel = normalizeToCartesian(agentOutput);
const check = validatePanel(panel, { rows: data, strict: true });

if (!check.ok) {
  // Agent retries with check.errors — codes, suggestions, fix patches
  throw check.errors;
}

<Chart panel={check.spec ?? panel} data={data} />`;

export function AgentCartesianGuidePage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Agent cartesian — validate → retry → eject</h1>
      <p style={docBodyStyle()}>
        End-to-end loop for LLM/MCP agents emitting <code>type: &quot;cartesian&quot;</code> panels.
        Start with the <Link to="/guides/agent-families">families overview</Link> if you need distribution or matrix too.
      </p>

      <h2 style={{ fontSize: 16 }}>1. MCP workflow</h2>
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
        {MCP_TUTORIAL}
      </pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>2. SDK validate before render</h2>
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
        {SDK_TUTORIAL}
      </pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>3. Tabular dashboards</h2>
      <p style={docBodyStyle()}>
        For CSV/chat tables, prefer <code>plan_dashboard</code> over hand-built panels — returns compiled KPIs,
        charts, decision log, and ranked follow-up questions. Then validate each block with{" "}
        <code>validate_panel</code>.
      </p>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>4. Playground presets (Generate spec)</h2>
      <p style={docBodyStyle()}>
        <Link to="/spec/blocks">Blocks Playground</Link> — edit JSON, preview chart, eject JSX. Open a
        RFC-002 preset, tweak intent/data, then click <strong>Generate spec</strong> for agent eval fixtures:
      </p>
      <ul style={{ ...docBodyStyle(), fontSize: 13, paddingLeft: 20 }}>
        <li>
          <Link to="/spec/blocks?preset=revenue-target">revenue-target</Link> — bar, line, rule, band
        </li>
        <li>
          <Link to="/spec/blocks?preset=ops-slo">ops-slo</Link> — latency trend + SLO overlays
        </li>
        <li>
          <Link to="/spec/blocks?preset=studio-cell">studio-cell</Link> — compact bar cell
        </li>
        <li>
          <Link to="/spec/blocks?preset=dual-metric">dual-metric</Link> — bar + line dual axis
        </li>
      </ul>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>5. Eject walkthrough (invalid → fixed → JSX)</h2>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        Interactive one-step repair: typo in <code>encoding.x.field</code>, validate, eject composable React.
      </p>
      <EjectWalkthrough />

      <h2 style={{ fontSize: 16, marginTop: 28 }}>6. Bad → fixed gallery</h2>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        One example per major validator code — cartesian, distribution, matrix, and cross-family strict gate.
      </p>
      <AgentErrorGallery />

      <h2 style={{ fontSize: 16, marginTop: 28 }}>7. Eject CLI</h2>
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
        Tool schemas: <Link to="/guides/agent-mcp-schemas">MCP OpenAPI bundle</Link>
        {" · "}
        <a
          href="https://github.com/Axidify/axicharts/blob/main/packages/charts-spec/CARTESIAN.md"
          target="_blank"
          rel="noreferrer"
        >
          CARTESIAN.md
        </a>
      </p>
    </div>
  );
}
