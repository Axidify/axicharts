import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { docBodyStyle, docCardStyle } from "../styles/docTokens";

const PLATFORM_VERSION = "0.4.38";
const PLANNER_VERSION = "0.2.5";
const ECHARTS_VERSION = "0.4.17";

const MATRIX = [
  {
    path: "Agent chat (Nest + Next)",
    packages: [
      "@axicharts/charts-spec",
      "@axicharts/charts",
      "@axicharts/charts-theme",
      "@axicharts/charts-echarts",
      "@axicharts/charts-planner",
      "uplot",
    ],
    rule: `Platform ${PLATFORM_VERSION} + echarts ${ECHARTS_VERSION} + planner ${PLANNER_VERSION}. See agent chat guide.`,
  },
  {
    path: "Hand-built cartesian (Path 1)",
    packages: ["@axicharts/charts", "@axicharts/charts-theme", "uplot"],
    rule: `charts + charts-theme + charts-core on the same minor (${PLATFORM_VERSION})`,
  },
  {
    path: "CSV → dashboard (Path 2)",
    packages: [
      "@axicharts/charts",
      "@axicharts/charts-spec",
      "@axicharts/charts-planner",
      "@axicharts/charts-theme",
      "uplot",
    ],
    rule: `Platform ${PLATFORM_VERSION}. Planner ${PLANNER_VERSION} peers spec ^${PLATFORM_VERSION}. Use ./tabular in Node.`,
  },
  {
    path: "Spec / agent JSON",
    packages: ["@axicharts/charts-spec", "@axicharts/charts", "@axicharts/charts-theme"],
    rule: "spec minor matches charts minor",
  },
  {
    path: "Batteries included",
    packages: ["@axicharts/charts-full", "echarts", "uplot"],
    rule: "charts-full minor matches @axicharts/charts minor",
  },
  {
    path: "Runtime embed / mosaic",
    packages: [
      "@axicharts/charts-runtime",
      "@axicharts/charts",
      "@axicharts/charts-spec",
      "@axicharts/charts-theme",
    ],
    rule: "runtime + spec + charts on the same minor; or use charts-full",
  },
  {
    path: "Planner server / CLI",
    packages: ["@axicharts/charts-planner", "@axicharts/charts-spec"],
    rule: "planner peers spec — use @axicharts/charts-planner/tabular in API processes",
  },
] as const;

const TESTED_COMBOS = [
  {
    chartsSpec: PLATFORM_VERSION,
    chartsEcharts: ECHARTS_VERSION,
    chartsPlanner: PLANNER_VERSION,
    status: "Tested — agent chat (Nest + Next)",
  },
  {
    chartsSpec: PLATFORM_VERSION,
    chartsEcharts: ECHARTS_VERSION,
    chartsPlanner: PLANNER_VERSION,
    status: "Tested — Axiboard tabular orchestrator",
  },
] as const;

export function VersionMatrixPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Version matrix</h1>
      <p style={docBodyStyle()}>
        AxiCharts is modular on npm, but adopters should keep a <strong>single platform minor</strong>{" "}
        across core packages. This page is the supported combo reference — see also{" "}
        <Link to="/guides/troubleshooting">troubleshooting</Link> and{" "}
        <Link to="/guides/agent-chat-integration">agent chat integration</Link>.
      </p>

      <section style={{ ...docCardStyle(), padding: 20, marginBottom: 20, boxShadow: "none" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Tested compatibility (current release)</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "8px" }}>charts-spec</th>
                <th style={{ padding: "8px" }}>charts-echarts</th>
                <th style={{ padding: "8px" }}>charts-planner</th>
                <th style={{ padding: "8px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {TESTED_COMBOS.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px" }}>
                    <code>{row.chartsSpec}</code>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <code>{row.chartsEcharts}</code>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <code>{row.chartsPlanner}</code>
                  </td>
                  <td style={{ padding: "8px", color: "#475569" }}>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
          <code>@axicharts/charts-echarts</code> is <strong>independently versioned</strong> from the
          platform lockstep train. It declares a peer on <code>@axicharts/charts-spec@^0.4.36</code>{" "}
          (tested with <code>{PLATFORM_VERSION}</code>).
        </p>
      </section>

      <div style={{ overflowX: "auto", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "10px 8px" }}>Adoption path</th>
              <th style={{ padding: "10px 8px" }}>Install</th>
              <th style={{ padding: "10px 8px" }}>Version rule</th>
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((row) => (
              <tr key={row.path} style={{ borderBottom: "1px solid #f1f5f9", verticalAlign: "top" }}>
                <td style={{ padding: "10px 8px", fontWeight: 500 }}>{row.path}</td>
                <td style={{ padding: "10px 8px" }}>
                  {row.packages.map((pkg) => (
                    <div key={pkg}>
                      <code>{pkg}</code>
                    </div>
                  ))}
                </td>
                <td style={{ padding: "10px 8px", color: "#475569", lineHeight: 1.6 }}>{row.rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section style={{ ...docCardStyle(), padding: 20, marginBottom: 16, boxShadow: "none" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Lockstep platform packages</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          These share one version number on each release (enforced by <code>pnpm check:versions</code> in
          CI):
        </p>
        <pre
          style={{
            marginTop: 12,
            padding: 12,
            background: "#f1f5f9",
            borderRadius: 8,
            fontSize: 12,
            overflow: "auto",
          }}
        >
          {`@axicharts/charts
@axicharts/charts-core
@axicharts/charts-theme
@axicharts/charts-spec
@axicharts/charts-runtime
@axicharts/charts-full
@axicharts/charts-canvas

Independently versioned siblings:
@axicharts/charts-echarts  (peers charts-spec at platform minor)
@axicharts/charts-map`}
        </pre>
      </section>

      <section style={{ ...docCardStyle(), padding: 20, marginBottom: 16, boxShadow: "none" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Planner is separate semver</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          <code>@axicharts/charts-planner</code> is <strong>{PLANNER_VERSION.split(".")[0]}.x</strong> and
          declares a <strong>peer</strong> on <code>@axicharts/charts-spec</code> at the platform minor
          (currently <code>^{PLATFORM_VERSION}</code>). Always install both at the app level. In API
          processes, import <code>@axicharts/charts-planner/tabular</code> — not the main entry.
        </p>
        <pre
          style={{
            marginTop: 12,
            padding: 12,
            background: "#0f172a",
            color: "#e2e8f0",
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          {`pnpm add @axicharts/charts@^${PLATFORM_VERSION} @axicharts/charts-spec@^${PLATFORM_VERSION} \\
  @axicharts/charts-planner@^${PLANNER_VERSION} @axicharts/charts-theme@^${PLATFORM_VERSION} \\
  @axicharts/charts-echarts@^${ECHARTS_VERSION} uplot`}
        </pre>
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#64748b" }}>
          Two <code>charts-spec</code> copies under <code>node_modules</code> usually means planner{" "}
          <code>0.2.0</code> (bundled spec <code>0.3.52</code>) — upgrade planner to <code>0.2.1+</code>.
        </p>
      </section>

      <section style={{ ...docCardStyle(), padding: 20, boxShadow: "none" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Scaffold CLI</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          <code>npx @axicharts/charts create-dashboard my-app</code> pins{" "}
          <code>@axicharts/charts*</code> to the releasing minor caret range and prints created files.
          Use <code>.</code> to scaffold into the current directory.
        </p>
        <pre
          style={{
            marginTop: 12,
            padding: 12,
            background: "#f1f5f9",
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          npx @axicharts/charts create-dashboard . --category cartesian
        </pre>
      </section>

      <p style={{ ...docBodyStyle(), marginTop: 24, fontSize: 13 }}>
        Related: <Link to="/guides/agent-chat-integration">Agent chat integration</Link> ·{" "}
        <Link to="/guides/csv-dashboard">CSV dashboard</Link> ·{" "}
        <Link to="/guides/choosing-your-path">Choosing your path</Link> ·{" "}
        <Link to="/packages">All packages</Link>
      </p>
    </div>
  );
}
