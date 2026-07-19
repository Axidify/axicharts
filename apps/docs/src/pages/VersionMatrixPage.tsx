import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { docBodyStyle, docCardStyle } from "../styles/docTokens";

const MATRIX = [
  {
    path: "Hand-built cartesian (Path 1)",
    packages: ["@axicharts/charts", "@axicharts/charts-theme", "uplot"],
    rule: "charts + charts-theme + charts-core on the same minor (e.g. 0.4.5)",
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
    rule:
      "Install charts-spec at the app level. Planner 0.2.1+ peers spec ^0.4.3 at the platform minor.",
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
    rule: "planner peers spec — never rely on a nested spec from an old planner release",
  },
] as const;

export function VersionMatrixPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Version matrix</h1>
      <p style={docBodyStyle()}>
        AxiCharts is modular on npm, but adopters should keep a <strong>single platform minor</strong>{" "}
        across core packages. This page is the supported combo reference for C147 trust fixes — see also{" "}
        <Link to="/guides/troubleshooting">troubleshooting</Link>.
      </p>

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
(+ canvas, echarts, map siblings at the same minor)`}
        </pre>
      </section>

      <section style={{ ...docCardStyle(), padding: 20, marginBottom: 16, boxShadow: "none" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Planner is separate semver</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          <code>@axicharts/charts-planner</code> is <strong>0.2.x</strong> and declares a{" "}
          <strong>peer</strong> on <code>@axicharts/charts-spec</code> at the platform minor (currently{" "}
          <code>^0.4.3</code>). Always install both at the app level:
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
          {`pnpm add @axicharts/charts@^0.4.5 @axicharts/charts-spec@^0.4.5 \\
  @axicharts/charts-planner@^0.2.1 @axicharts/charts-theme@^0.4.5 uplot`}
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
        Related: <Link to="/guides/csv-dashboard">CSV dashboard</Link> ·{" "}
        <Link to="/guides/choosing-your-path">Choosing your path</Link> ·{" "}
        <Link to="/packages">All packages</Link>
      </p>
    </div>
  );
}
