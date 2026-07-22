import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { docBodyStyle, docCardStyle } from "../styles/docTokens";

const ARCHITECTURE = `User ask
  → agent tool (search_tasks, get_time_summary, render_chart, …)
  → server adapter OR tabular fallback
  → validated AgentChartEnvelope
  → lazy AxiChartsBlock (Next.js client)`;

const NEST_ADAPTER = `// apps/api — NestJS service (CJS compile)
import {
  validatePanel,
  toUserFacingHints,
  type PanelSpec,
} from "@axicharts/charts-spec";

export type AgentChartEnvelope = {
  specVersion: 1;
  visualizationHint: "chart" | "table" | "none";
  panel: PanelSpec;
  data: Record<string, unknown>[];
};

/** Domain adapter — map tool result rows to a validated envelope. */
export function buildChartEnvelope(
  panel: PanelSpec,
  rows: Record<string, unknown>[],
): AgentChartEnvelope | { error: string; hints: string[] } {
  const result = validatePanel(panel, { rows, strict: true });
  if (!result.ok) {
    return { error: "invalid_chart_spec", hints: toUserFacingHints(result.errors) };
  }
  return {
    specVersion: 1,
    visualizationHint: "chart",
    panel: result.spec,
    data: rows,
  };
}

/** Tabular fallback when no domain adapter exists. */
export async function planTabularFallback(
  rows: Record<string, unknown>[],
  intent: string,
) {
  const { planDashboardFromRows } = await import("@axicharts/charts-planner/tabular");
  return planDashboardFromRows(rows, { intent });
}`;

const NEXT_BLOCK = `// apps/web — lazy chart block (client component)
"use client";

import dynamic from "next/dynamic";
import type { PanelSpec } from "@axicharts/charts-spec";

const Chart = dynamic(
  () => import("@axicharts/charts-spec").then((m) => m.Chart),
  { ssr: false, loading: () => <p>Loading chart…</p> },
);

// Pie/donut: lazy-load charts-echarts distribution renderer
const DistributionChart = dynamic(
  () => import("@axicharts/charts/distribution").then((m) => m.DistributionChart),
  { ssr: false },
);

export function AxiChartsBlock({
  panel,
  data,
}: {
  panel: PanelSpec;
  data: Record<string, unknown>[];
}) {
  if (panel.type === "distribution") {
    return <DistributionChart panel={panel} data={data} />;
  }
  return <Chart panel={panel} data={data} />;
}`;

const JEST_CONFIG = `// jest.config.js — only if you need real subpath resolution in tests
module.exports = {
  moduleNameMapper: {
    "^@axicharts/charts-planner/tabular$":
      "<rootDir>/node_modules/@axicharts/charts-planner/dist/entry/tabular.js",
    "^@axicharts/charts-spec/planning$":
      "<rootDir>/node_modules/@axicharts/charts-spec/dist/entry/planning.js",
  },
  transformIgnorePatterns: ["node_modules/(?!@axicharts/)"],
};

// Preferred: mock at the adapter boundary
jest.mock("../chartAdapter", () => ({
  buildChartEnvelope: jest.fn(() => ({
    specVersion: 1,
    visualizationHint: "chart",
    panel: { type: "cartesian", encoding: { x: { field: "status" } }, marks: [{ type: "bar", field: "count" }] },
    data: [{ status: "open", count: 3 }],
  })),
}));`;

const INSTALL = `pnpm add \\
  @axicharts/charts-spec@^0.4.36 \\
  @axicharts/charts@^0.4.36 \\
  @axicharts/charts-theme@^0.4.36 \\
  @axicharts/charts-echarts@^0.4.15 \\
  @axicharts/charts-planner@^0.2.4 \\
  uplot`;

function CodeBlock({ children, dark }: { children: string; dark?: boolean }): ReactElement {
  return (
    <pre
      style={{
        marginTop: 12,
        padding: 12,
        background: dark ? "#0f172a" : "#f1f5f9",
        color: dark ? "#e2e8f0" : "#0f172a",
        borderRadius: 8,
        fontSize: 12,
        overflow: "auto",
        lineHeight: 1.5,
      }}
    >
      {children}
    </pre>
  );
}

export function AgentChatIntegrationGuidePage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Agent chat integration</h1>
      <p style={docBodyStyle()}>
        Production pattern for AI chat: the model calls domain tools; your <strong>server</strong> builds
        and validates chart specs — never ask the model to author <code>encoding</code> /{" "}
        <code>marks[]</code> for covered tools. This guide covers NestJS + Next.js; MCP is optional.
      </p>

      <section style={{ ...docCardStyle(), padding: 20, marginBottom: 20, boxShadow: "none" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Architecture</h2>
        <CodeBlock>{ARCHITECTURE}</CodeBlock>
        <p style={{ margin: "12px 0 0", fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          Use <strong>domain adapters</strong> for known tools (tasks, time summaries). Fall back to{" "}
          <code>planDashboardFromRows</code> from <code>@axicharts/charts-planner/tabular</code> when no
          adapter exists. Return a typed envelope to the chat timeline; render lazily on the client.
        </p>
      </section>

      <h2 style={{ fontSize: 16 }}>Install (tested combo)</h2>
      <CodeBlock dark>{INSTALL}</CodeBlock>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        Platform packages (<code>charts</code>, <code>charts-spec</code>, <code>charts-theme</code>) share
        one minor. <code>charts-echarts</code> is independently versioned — see{" "}
        <Link to="/guides/versions">version matrix</Link>.
      </p>

      <h2 style={{ fontSize: 16 }}>1. Server adapter (NestJS)</h2>
      <p style={docBodyStyle()}>
        Validate on the server with <code>validatePanel</code>. Map validation errors to chat-friendly
        hints with <code>toUserFacingHints</code> so the UI can show a fallback message instead of a raw
        error code.
      </p>
      <CodeBlock dark>{NEST_ADAPTER}</CodeBlock>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        For tabular fallback in CJS-compiled Nest, use <strong>dynamic import</strong> of{" "}
        <code>@axicharts/charts-planner/tabular</code> — static imports fail under CommonJS. See{" "}
        <a href="https://www.npmjs.com/package/@axicharts/charts-planner">charts-planner README</a>.
      </p>

      <h2 style={{ fontSize: 16 }}>2. Envelope contract</h2>
      <p style={docBodyStyle()}>
        Keep a stable shape on your activity timeline. These fields are the integration surface — we plan
        to freeze them before 0.5:
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 16 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
            <th style={{ padding: "8px" }}>Field</th>
            <th style={{ padding: "8px" }}>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "8px" }}>
              <code>specVersion</code>
            </td>
            <td style={{ padding: "8px", color: "#475569" }}>
              Always <code>1</code> today — matches <code>charts-spec</code> panel JSON
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "8px" }}>
              <code>visualizationHint</code>
            </td>
            <td style={{ padding: "8px", color: "#475569" }}>
              <code>chart</code> | <code>table</code> | <code>none</code> — lets the chat UI skip render
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "8px" }}>
              <code>panel</code>
            </td>
            <td style={{ padding: "8px", color: "#475569" }}>
              Validated <code>PanelSpec</code> — cartesian (<code>marks[]</code>) or distribution (pie/donut)
            </td>
          </tr>
          <tr>
            <td style={{ padding: "8px" }}>
              <code>data</code>
            </td>
            <td style={{ padding: "8px", color: "#475569" }}>
              Row array passed to the renderer alongside <code>panel</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 style={{ fontSize: 16 }}>3. Client render (Next.js)</h2>
      <p style={docBodyStyle()}>
        Lazy-load chart renderers so the first chat chart does not block the page shell. Cartesian panels
        use uPlot via <code>@axicharts/charts-spec</code>; distribution (pie/donut) uses{" "}
        <code>@axicharts/charts-echarts</code> — expect two lazy chunks (~300 KB gzip combined for
        on-demand chat).
      </p>
      <CodeBlock dark>{NEXT_BLOCK}</CodeBlock>

      <h2 style={{ fontSize: 16 }}>4. Pie vs cartesian</h2>
      <p style={docBodyStyle()}>
        Two renderer families today (RFC-004): <code>type: &quot;cartesian&quot;</code> for bar/line/area,{" "}
        <code>type: &quot;distribution&quot;</code> for pie/donut. Domain adapters should set{" "}
        <code>chartStyle: &quot;pie&quot;</code> and emit a distribution panel; the tabular planner
        currently emits cartesian only — use adapters for pie intents until tabular pie support ships.
      </p>

      <h2 id="jest--cjs-test-runners" style={{ fontSize: 16 }}>
        Jest / CJS test runners
      </h2>
      <p style={docBodyStyle()}>
        <code>@axicharts/charts-planner</code> and <code>@axicharts/charts-spec</code> subpaths are
        ESM-only. Jest may fail to resolve <code>/tabular</code> or <code>/planning</code> without
        configuration.
      </p>
      <CodeBlock dark>{JEST_CONFIG}</CodeBlock>

      <h2 style={{ fontSize: 16 }}>When to use MCP</h2>
      <p style={docBodyStyle()}>
        <Link to="/guides/agent-families">charts-mcp</Link> exposes the same validation surface as the SDK
        (<code>validate_panel</code>, <code>create_panel</code>, <code>plan_dashboard</code>). For
        production chat with known tools, server adapters + tabular fallback are usually simpler than
        wiring 14 OpenAPI tools. Use MCP for agent playgrounds and eval harnesses.
      </p>

      <p style={{ ...docBodyStyle(), marginTop: 24, fontSize: 13 }}>
        Related: <Link to="/guides/agent-cartesian">Agent cartesian deep dive</Link> ·{" "}
        <Link to="/guides/agent-families">Agent families</Link> ·{" "}
        <Link to="/guides/versions">Version matrix</Link> ·{" "}
        <Link to="/guides/troubleshooting">Troubleshooting</Link>
      </p>
    </div>
  );
}
