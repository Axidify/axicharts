import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { ChartContainer, LineChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";
import { PLANNER_CLI_CODE } from "../demos/runtimePlannerDemo";

const CODE = `import { ChartContainer, LineChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

export function LatencyPanel() {
  return (
    <ChartContainer theme={cleanTheme} height={200}>
      <LineChart
        categories={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
        series={[{ name: "p95", data: [42, 38, 55, 49, 62, 58, 71] }]}
        fill
      />
    </ChartContainer>
  );
}`;

const codeBlockStyle = {
  padding: 14,
  borderRadius: 8,
  fontSize: 11,
  lineHeight: 1.5,
  overflow: "auto" as const,
};

export function StartPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Getting started</h1>
      <h2 style={{ fontSize: 16 }}>Install</h2>
      <pre
        style={{
          ...codeBlockStyle,
          background: "#0f172a",
          color: "#e2e8f0",
          fontSize: 12,
        }}
      >
        {`npm install @axicharts/charts @axicharts/charts-theme echarts uplot`}
      </pre>
      <h2 style={{ fontSize: 16, marginTop: 28 }}>Live example</h2>
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 16,
          background: "#fff",
          maxWidth: 640,
        }}
      >
        <ChartContainer theme={cleanTheme} height={200}>
          <LineChart
            categories={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            series={[{ name: "p95", data: [42, 38, 55, 49, 62, 58, 71] }]}
            fill
          />
        </ChartContainer>
      </div>
      <h2 style={{ fontSize: 16, marginTop: 28 }}>Source</h2>
      <pre
        style={{
          ...codeBlockStyle,
          background: "#f1f5f9",
        }}
      >
        {CODE}
      </pre>

      <h2 id="planner-cli" style={{ fontSize: 16, marginTop: 28 }}>Dashboarder + planner CLI</h2>
      <p style={{ color: "#475569", maxWidth: 640, lineHeight: 1.6, fontSize: 14 }}>
        Layer 3 runtime dashboards use <code>@axicharts/charts-runtime</code> with live adapter
        feeds. Phase 3 <code>@axicharts/charts-planner</code> maps natural-language intent to a{" "}
        <code>DashboardPlan.feed</code> — use the CLI locally, HTTP server, or Dashboarder{" "}
        <strong>Plan</strong>.
      </p>
      <pre
        style={{
          ...codeBlockStyle,
          background: "#0f172a",
          color: "#e2e8f0",
        }}
      >
        {PLANNER_CLI_CODE}
      </pre>
      <p style={{ color: "#475569", maxWidth: 640, lineHeight: 1.6, fontSize: 13 }}>
        <Link to="/runtime">Runtime SDK</Link>
        {" · "}
        <Link to="/runtime#planner-http">Planner HTTP API</Link>
        {" · "}
        <Link to="/runtime/import#planner-feeds">Planner feed gallery index</Link>
      </p>

      <h2 id="share-import" style={{ fontSize: 16, marginTop: 28 }}>
        Share ↔ import round-trip
      </h2>
      <p style={{ color: "#475569", maxWidth: 640, lineHeight: 1.6, fontSize: 14 }}>
        Dashboarder <strong>Share</strong> exports portable JSON with planner <code>meta</code>{" "}
        (layout, feed, template, mosaic preset). <strong>Import</strong> validates the envelope and
        restores builder state — portable runtime embed JSON omits <code>meta</code>. Shipped
        fixtures: <code>ops-dashboard.share.json</code> and <code>ops-workspace.workspace.json</code>.
      </p>
      <p style={{ color: "#475569", maxWidth: 640, lineHeight: 1.6, fontSize: 13 }}>
        <Link to="/runtime#share-import">Runtime share ↔ import flow</Link>
        {" · "}
        <Link to="/runtime/schema#share-meta">Schema § meta</Link>
        {" · "}
        <Link to="/runtime/import#share-import-track">Import gallery track notes</Link>
        {" · "}
        <Link to="/runtime/links#share-import">Deep-link presets</Link>
      </p>
    </div>
  );
}
