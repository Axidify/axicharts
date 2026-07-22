import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { AgentSimulationTable } from "../components/AgentSimulationTable";
import { docBodyStyle, docCardStyle } from "../styles/docTokens";

const MCP_WORKFLOW = `# 1. Add MCP server to Cursor (~/.cursor/mcp.json)
{
  "mcpServers": {
    "axicharts": {
      "command": "npx",
      "args": ["-y", "@axicharts/charts-mcp"]
    }
  }
}

# 2. Describe data (always first)
describe_data_profile({ rows: sampleRows })

# 3. Draft a panel by family
create_panel({
  family: "cartesian",   # bar · line · area + overlays
  intent: "weekly revenue bars with target line at 50",
  fields: ["week", "revenue", "target"]
})

create_panel({
  family: "distribution", # pie · donut · funnel
  intent: "browser share donut with labels",
  fields: ["browser", "share"]
})

create_panel({
  family: "matrix",       # heatmap grid
  intent: "latency heatmap by hour and day",
  fields: ["hour", "day", "latency"]
})

# 4. Validate before render (mandatory)
validate_panel({ spec: panel, rows: sampleRows })

# 5. On error — apply fix patch or use suggestion, retry
# UNKNOWN_FIELD → fix["marks[0].field"] = "revenue"

# 6. Render in app
import { Chart } from "@axicharts/charts-spec";
<Chart panel={validatedSpec} data={rows} />

# 7. Pin to codebase when done
npx @axicharts/charts-spec eject panel.json`;

const FAMILIES = [
  {
    id: "cartesian",
    marks: "bar, line, area, rule, band",
    when: "Trends, comparisons, mixed bar+line, SLO overlays",
    example: "Weekly revenue bars with target line and healthy band 44–52",
  },
  {
    id: "distribution",
    marks: "arc, funnel, donut, cell, label",
    when: "Part-to-whole, stage funnel, share breakdown",
    example: "Pipeline funnel by stage with percent labels",
  },
  {
    id: "matrix",
    marks: "cell, colorScale, axis",
    when: "2D grids — hour×day latency, correlation intensity",
    example: "API latency heatmap by hour and weekday",
  },
] as const;

export function AgentFamiliesGuidePage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Agent families — 5-minute MCP loop</h1>
      <p style={docBodyStyle()}>
        Ship agent-generated dashboards with three closed grammars:{" "}
        <strong>cartesian</strong>, <strong>distribution</strong>, and <strong>matrix</strong>.
        Every panel validates before render — agents retry from structured errors, humans eject to JSX.
      </p>

      <h2 style={{ fontSize: 16 }}>Families at a glance</h2>
      <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        {FAMILIES.map((family) => (
          <div key={family.id} style={{ ...docCardStyle(), padding: 16, boxShadow: "none" }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
              <code>{family.id}</code> — <span style={{ fontWeight: 400 }}>{family.marks}</span>
            </div>
            <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b" }}>{family.when}</p>
            <p style={{ margin: 0, fontSize: 13 }}>
              Intent: <em>{family.example}</em>
            </p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 16 }}>MCP workflow</h2>
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
        {MCP_WORKFLOW}
      </pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>Rules agents must follow</h2>
      <ul style={{ ...docBodyStyle(), paddingLeft: 20 }}>
        <li>
          Call <code>list_marks(&#123; family &#125;)</code> before inventing mark names — catalogs are closed.
        </li>
        <li>
          Never emit <code>type: &quot;line&quot;</code>, <code>&quot;combo&quot;</code>, or raw{" "}
          <code>&quot;heatmap&quot;</code> — use family types + <code>marks[]</code>.
        </li>
        <li>
          <code>validate_panel</code> is mandatory. <code>needsReview: true</code> means refine intent, do not render.
        </li>
        <li>
          Waterfall on tabular agent path compiles to cartesian bridge; gauge and geo remain Tier-2.
        </li>
      </ul>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>Composition simulation</h2>
      <p style={docBodyStyle()}>
        Every family ships a simulation suite — <strong>silent_bad must stay 0</strong> (no charts that compile but lie).
      </p>
      <AgentSimulationTable />

      <h2 style={{ fontSize: 16, marginTop: 28 }}>Runtime gate</h2>
      <pre
        style={{
          padding: 14,
          borderRadius: 8,
          background: "#f1f5f9",
          fontSize: 12,
          overflow: "auto",
        }}
      >
        {`import { Chart, validatePanel } from "@axicharts/charts-spec";

const check = validatePanel(panel, { rows, strict: true });
if (!check.ok) throw check.errors; // agent retries

<Chart panel={check.spec} data={rows} />`}
      </pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>Further reading</h2>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        <Link to="/guides/agent-chat-integration">Agent chat integration (Nest + Next)</Link>
        {" · "}
        <Link to="/guides/agent-cartesian">Cartesian deep dive + error gallery</Link>
        {" · "}
        <Link to="/guides/agent-mcp-schemas">MCP tool schemas (OpenAPI)</Link>
        {" · "}
        <Link to="/spec/blocks">Blocks playground</Link>
        {" · "}
        <a
          href="https://github.com/Axidify/axiboard/blob/main/docs/charts/rfcs/RFC-004-agent-chart-families.md"
          target="_blank"
          rel="noreferrer"
        >
          RFC-004 families
        </a>
        {" · "}
        <a
          href="https://github.com/Axidify/axicharts/tree/main/packages/charts-mcp/agent-skills"
          target="_blank"
          rel="noreferrer"
        >
          MCP agent skills
        </a>
      </p>
    </div>
  );
}
