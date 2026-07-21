import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { docBodyStyle } from "../styles/docTokens";

/** Reference entry-shim gzip sizes (informational). Peers excluded. */
const categoryRows = [
  { subpath: "@axicharts/charts/quick", gzip: "669 B", peers: "uplot", charts: "QuickLineChart" },
  { subpath: "@axicharts/charts/cartesian", gzip: "1.26 KB", peers: "uplot", charts: "Line, area, bar, combo, scatter + chrome" },
  { subpath: "@axicharts/charts/studio", gzip: "—", peers: "uplot", charts: "StudioLineChart / StudioBarChart (see /studio)" },
  { subpath: "@axicharts/charts/distribution", gzip: "743 B", peers: "echarts", charts: "Pie, funnel, boxplot, histogram, …" },
  { subpath: "@axicharts/charts/financial", gzip: "593 B", peers: "echarts", charts: "Waterfall, candlestick" },
  { subpath: "@axicharts/charts/matrix", gzip: "780 B", peers: "echarts", charts: "Heatmap, radar, treemap, sunburst, …" },
  { subpath: "@axicharts/charts/industrial", gzip: "444 B", peers: "—", charts: "Gauge, digital, status lamp" },
  { subpath: "@axicharts/charts/kpi", gzip: "419 B", peers: "—", charts: "Stat + presentation motion" },
  { subpath: "@axicharts/charts (root)", gzip: "2.03 KB", peers: "echarts + uplot", charts: "Full barrel — discouraged" },
  { subpath: "@axicharts/charts-full", gzip: "70 B", peers: "echarts + uplot", charts: "Meta shim → pulls full stack" },
] as const;

const peerRows = [
  { peer: "uplot", when: "Line, bar, area, combo, cartesian, quick, studio", approx: "~45 KB min+gzip (app install)" },
  { peer: "echarts", when: "Pie, candlestick, heatmap, distribution, financial, matrix", approx: "~330 KB min+gzip (app install)" },
  { peer: "react + react-dom", when: "Always", approx: "Your app baseline" },
] as const;

export function BenchmarksPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Bundle benchmarks</h1>
      <p style={docBodyStyle()}>
        Reference <strong>gzip of the subpath entry file</strong> — your app total also includes{" "}
        <code>charts-canvas</code>, <code>charts-core</code>, <code>charts-theme</code>, and peers.
      </p>

      <h2 style={{ fontSize: 16 }}>Category entry (gzip, measured)</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: "8px 10px" }}>Import</th>
              <th style={{ padding: "8px 10px" }}>Entry gzip</th>
              <th style={{ padding: "8px 10px" }}>Peers</th>
              <th style={{ padding: "8px 10px" }}>Charts</th>
            </tr>
          </thead>
          <tbody>
            {categoryRows.map((row) => (
              <tr key={row.subpath} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px", fontFamily: "monospace", fontSize: 11 }}>{row.subpath}</td>
                <td style={{ padding: "10px" }}>{row.gzip}</td>
                <td style={{ padding: "10px" }}>
                  <code>{row.peers}</code>
                </td>
                <td style={{ padding: "10px", color: "#475569" }}>{row.charts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 16, marginTop: 32 }}>Line-only dashboard recipe</h2>
      <p style={docBodyStyle()}>
        Ops dashboard with KPI strip + week chart — <strong>no ECharts peer</strong>:
      </p>
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
// or grow: import { ChartContainer, LineChart } from "@axicharts/charts/cartesian";

npx @axicharts/charts create-dashboard my-ops --category cartesian`}
      </pre>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        Scaffold verifies: cartesian template does not list <code>echarts</code> in{" "}
        <code>package.json</code>. See <Link to="/guides/imports">import cheat sheet</Link>.
      </p>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>Peer dependencies (not in entry shim)</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
            <th style={{ padding: "8px 10px" }}>Peer</th>
            <th style={{ padding: "8px 10px" }}>When</th>
            <th style={{ padding: "8px 10px" }}>Typical install size</th>
          </tr>
        </thead>
        <tbody>
          {peerRows.map((row) => (
            <tr key={row.peer} style={{ borderBottom: "1px solid #e2e8f0" }}>
              <td style={{ padding: "10px" }}>
                <code>{row.peer}</code>
              </td>
              <td style={{ padding: "10px" }}>{row.when}</td>
              <td style={{ padding: "10px", color: "#64748b" }}>{row.approx}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>Core packages (gzip)</h2>
      <ul style={{ fontSize: 14, lineHeight: 1.8, color: "#475569" }}>
        <li>
          <code>charts-canvas</code> (uPlot adapter): 11.62 KB
        </li>
        <li>
          <code>charts-core</code>: 1.56 KB
        </li>
        <li>
          <code>charts-theme</code>: 1.45 KB
        </li>
        <li>
          <code>charts-echarts</code> (lazy): 20.09 KB entry — only when you import ECharts chart types
        </li>
      </ul>

      <p style={{ ...docBodyStyle(), marginTop: 24, fontSize: 13 }}>
        Full methodology + live latency:{" "}
        <a
          href="https://github.com/Axidify/axicharts/blob/main/benchmarks/BENCHMARKS.md"
          target="_blank"
          rel="noreferrer"
        >
          benchmarks/BENCHMARKS.md
        </a>
        {" · "}
        Re-run: <code>pnpm bench</code>
      </p>
    </div>
  );
}
