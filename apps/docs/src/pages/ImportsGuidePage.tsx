import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { docBodyStyle, docCardStyle } from "../styles/docTokens";

const rows = [
  {
    subpath: "@axicharts/charts/quick",
    peers: "uplot",
    charts: "QuickLineChart hello-world",
    use: "Fastest first chart",
  },
  {
    subpath: "@axicharts/charts/cartesian",
    peers: "uplot",
    charts: "Line, area, bar, combo, scatter + chrome",
    use: "Ops / analytics dashboards (recommended grow path)",
  },
  {
    subpath: "@axicharts/charts/studio",
    peers: "uplot",
    charts: "StudioLineChart / StudioBarChart editorial SVG",
    use: "Pretty defaults without hand-styling",
  },
  {
    subpath: "@axicharts/charts/distribution",
    peers: "echarts",
    charts: "Pie, funnel, boxplot, histogram, …",
    use: "Distribution charts",
  },
  {
    subpath: "@axicharts/charts/financial",
    peers: "echarts",
    charts: "Waterfall, candlestick",
    use: "Finance panels",
  },
  {
    subpath: "@axicharts/charts/matrix",
    peers: "echarts",
    charts: "Heatmap, radar, treemap, sunburst, …",
    use: "Matrix / hierarchy charts",
  },
  {
    subpath: "@axicharts/charts (root)",
    peers: "echarts + uplot",
    charts: "Full barrel",
    use: "Discouraged — pulls both backends",
  },
  {
    subpath: "@axicharts/charts-full",
    peers: "echarts + uplot",
    charts: "Meta-package: charts + spec + runtime + theme",
    use: "Batteries included / full platform",
  },
] as const;

export function ImportsGuidePage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Import cheat sheet</h1>
      <p style={docBodyStyle()}>
        Pick a <strong>category subpath</strong> so you only install the peers you need. Line-only
        dashboards need <code>uplot</code> only — not <code>echarts</code>.
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: "8px 10px" }}>Import from</th>
              <th style={{ padding: "8px 10px" }}>Peer deps</th>
              <th style={{ padding: "8px 10px" }}>Charts</th>
              <th style={{ padding: "8px 10px" }}>When</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.subpath} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px", fontFamily: "monospace", fontSize: 12 }}>
                  {row.subpath}
                </td>
                <td style={{ padding: "10px" }}>
                  <code>{row.peers}</code>
                </td>
                <td style={{ padding: "10px", color: "#475569" }}>{row.charts}</td>
                <td style={{ padding: "10px" }}>{row.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 16, marginTop: 32 }}>Line-only recipe</h2>
      <pre
        style={{
          padding: 14,
          borderRadius: 8,
          background: "#0f172a",
          color: "#e2e8f0",
          fontSize: 12,
          overflow: "auto",
        }}
      >
        {`pnpm add @axicharts/charts @axicharts/charts-theme uplot

import { QuickLineChart } from "@axicharts/charts/quick";
// grow → @axicharts/charts/cartesian`}
      </pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>Anti-patterns</h2>
      <div style={{ ...docCardStyle(), padding: 16, boxShadow: "none" }}>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7, fontSize: 14, color: "#475569" }}>
          <li>
            <code>import from "@axicharts/charts"</code> when you only need line/bar — use{" "}
            <code>/cartesian</code> or <code>/quick</code>
          </li>
          <li>
            Installing <code>echarts</code> for a single sparkline — only needed for pie, candlestick,
            heatmap, etc.
          </li>
          <li>
            Mixing unmatched package versions — keep <code>charts</code>, <code>charts-theme</code>,{" "}
            <code>charts-core</code> on the same minor
          </li>
        </ul>
      </div>

      <p style={{ ...docBodyStyle(), marginTop: 24, fontSize: 13 }}>
        Measured bundle sizes: <Link to="/benchmarks">Benchmarks</Link> · Scaffold:{" "}
        <code>npx @axicharts/charts create-dashboard my-app --category cartesian</code>
      </p>
    </div>
  );
}
