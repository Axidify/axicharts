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
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Dashboard card grids — plot height &amp; legend</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          <code>minHeight</code> on <code>ChartContainer</code> is the <strong>plot area</strong> budget.
          Multi-series legends render below the plot and the container grows automatically — single- and
          multi-series cards in the same CSS grid row keep aligned canvases. Use{" "}
          <code>legendVariant=&quot;compact&quot;</code> in tight tiles. All-zero weeks still render axes
          and category clicks; a dashed <strong>All values are zero</strong> caption appears over the plot.
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
          {`<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
  <ChartContainer theme={cleanTheme} minHeight={176} legendVariant="compact">
    <LineChart … single series … />
  </ChartContainer>
  <ChartContainer theme={cleanTheme} minHeight={176} legendVariant="compact">
    <LineChart … two series — legend below plot … />
  </ChartContainer>
</div>`}
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

      <section style={{ ...docCardStyle(), padding: 20, marginBottom: 16, boxShadow: "none" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Version mismatch across packages</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          Keep <code>@axicharts/charts</code>, <code>@axicharts/charts-theme</code>, and{" "}
          <code>@axicharts/charts-core</code> on the <strong>same minor version</strong>. CI runs{" "}
          <code>pnpm check:versions</code> in the monorepo. See the{" "}
          <Link to="/guides/versions">version matrix</Link> for path-specific combos (CSV, full,
          runtime, planner).
        </p>
        <p style={{ margin: "12px 0 0", fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          <strong>Planner + spec:</strong> install <code>@axicharts/charts-spec</code> at the app level
          alongside <code>@axicharts/charts-planner</code> — planner peers spec at the platform minor
          (e.g. planner <code>0.2.1</code> + spec/charts <code>0.4.3+</code>). Two spec versions in{" "}
          <code>node_modules</code> usually means an outdated planner dependency; upgrade planner or align
          spec explicitly.
        </p>
      </section>

      <section style={{ ...docCardStyle(), padding: 20, marginBottom: 16, boxShadow: "none" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Zero / flat weeks and click policy</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          Charts always emit category clicks (including <code>value === 0</code> and all-zero weeks).
          A flat-zero caption hints when every series is zero. Whether to open a drilldown or no-op
          is <strong>app policy</strong> — check <code>value</code> and <code>meta</code> in{" "}
          <code>onCategoryClick</code>; optionally use <code>cursor: default</code> on no-op bands in
          your own chrome.
        </p>
      </section>

      <section style={{ ...docCardStyle(), padding: 20, boxShadow: "none" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Experimental imports</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          Paths under <code>@axicharts/charts/experimental/*</code> are unstable — no semver guarantees.
          Avoid in production unless you pin and test explicitly.
        </p>
      </section>
    </div>
  );
}
