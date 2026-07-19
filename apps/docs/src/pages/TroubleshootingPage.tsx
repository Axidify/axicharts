import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { docBodyStyle, docCardStyle } from "../styles/docTokens";

export function TroubleshootingPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Troubleshooting</h1>
      <p style={docBodyStyle()}>
        Common integration issues when adding AxiCharts to Vite, Next.js, or an existing admin app.
      </p>

      <section style={{ ...docCardStyle(), padding: 20, marginBottom: 16, boxShadow: "none" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Chart renders at 0×0 or collapses in flex/grid</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          <code>ChartContainer</code> needs an explicit <code>height</code> or <code>minHeight</code>. Flex
          parents without a defined cross-axis size will collapse the chart. See{" "}
          <Link to="/start">Start here § Layout</Link>.
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
          {`<ChartContainer minHeight={280} width="100%">…</ChartContainer>`}
        </pre>
      </section>

      <section style={{ ...docCardStyle(), padding: 20, marginBottom: 16, boxShadow: "none" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Vite — peer dependency not found (uplot / echarts)</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          Install peers at the app level. Line-only dashboards need <code>uplot</code> only — see{" "}
          <Link to="/guides/imports">import cheat sheet</Link>.
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
          pnpm add uplot
          {"\n"}# pie / candlestick / heatmap only:
          {"\n"}pnpm add echarts
        </pre>
      </section>

      <section style={{ ...docCardStyle(), padding: 20, marginBottom: 16, boxShadow: "none" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Next.js / SSR — hydration mismatch or blank canvas</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          Charts are client components. Use <code>&apos;use client&apos;</code> on pages that render charts.
          Server renders a skeleton; canvas/uPlot hydrates on the client. For App Router, dynamic import with{" "}
          <code>ssr: false</code> is acceptable for chart-only subtrees.
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
          {`import dynamic from "next/dynamic";

const LatencyPanel = dynamic(
  () => import("./LatencyPanel").then((m) => m.LatencyPanel),
  { ssr: false, loading: () => <div style={{ minHeight: 280 }} /> },
);`}
        </pre>
      </section>

      <section style={{ ...docCardStyle(), padding: 20, marginBottom: 16, boxShadow: "none" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Bundle unexpectedly large</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          Avoid <code>import from &quot;@axicharts/charts&quot;</code> when you only need line/bar. Use{" "}
          <code>/quick</code> or <code>/cartesian</code>. Don&apos;t install <code>echarts</code> unless you
          use pie, candlestick, or heatmap. See <Link to="/benchmarks">benchmarks</Link>.
        </p>
      </section>

      <section style={{ ...docCardStyle(), padding: 20, boxShadow: "none" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Version mismatch across packages</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          Keep <code>@axicharts/charts</code>, <code>@axicharts/charts-theme</code>, and{" "}
          <code>@axicharts/charts-core</code> on the <strong>same minor version</strong>. Mixed 0.3.x minors
          can cause subtle theme or scale bugs.
        </p>
      </section>
    </div>
  );
}
