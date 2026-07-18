import type { ReactElement, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Chart,
  ejectPanel,
  planPanelsFromProfile,
  suggestTemplate,
} from "@axicharts/charts-spec";
import { SPEC_PANEL, SPEC_PANEL_DATA, SPEC_PROFILE } from "../demos/specDemo";
import { PHASE3_PLANNER_CODE } from "../demos/specPlannerDemo";
import { PLANNER_FEED_ROWS } from "@axicharts/charts-runtime/validation";

const PANEL_CODE = `import { Chart } from "@axicharts/charts-spec";

<Chart
  panel={{
    type: "line",
    encoding: {
      x: { field: "day", type: "nominal" },
      y: { field: "value", type: "quantitative" },
    },
    fill: true,
    height: 200,
    valueSuffix: " ms",
  }}
  data={[
    { day: "Mon", value: 42 },
    { day: "Tue", value: 38 },
    // ...
  ]}
/>`;

const PLANNER_CODE = `import { planPanelsFromProfile, suggestTemplate } from "@axicharts/charts-spec";

const profile = {
  metrics: [
    { name: "cpu", unit: "%", tags: { vertical: "ops", refresh: "live" } },
    { name: "p95_latency", unit: "ms", tags: { vertical: "ops" } },
    // ...
  ],
};

suggestTemplate(profile);       // → "ops-2x2"
planPanelsFromProfile(profile); // → PanelSpec[]`;

const COMPILER_CODE = `import { registerSpecCompiler } from "@axicharts/charts-spec";

registerSpecCompiler({
  id: "acme-defaults",
  compile(panel, { data, profile }) {
    if (panel.type === "line") return { ...panel, fill: true, height: 200 };
    return panel;
  },
});`;

function Section({
  title,
  subtitle,
  id,
  children,
}: {
  title: string;
  subtitle?: string;
  id?: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section
      id={id}
      style={{
        marginTop: 28,
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
        <strong>{title}</strong>
        {subtitle ? (
          <span style={{ marginLeft: 8, fontSize: 12, color: "#64748b" }}>{subtitle}</span>
        ) : null}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </section>
  );
}

export function SpecPage(): ReactElement {
  const suggestedTemplate = suggestTemplate(SPEC_PROFILE);
  const plannedPanels = planPanelsFromProfile(SPEC_PROFILE);
  const ejected = ejectPanel(plannedPanels[0]!);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Charts spec</h1>
      <p style={{ color: "#475569", maxWidth: 640 }}>
        Layer 2 — JSON panel specs, vertical templates, metric profiles → panels, and eject-to-JSX
        for full control. <strong>Direction:</strong> cartesian building blocks —{" "}
        <code>type: &quot;cartesian&quot;</code> + <code>marks[]</code> with validation before render
        (see <code>packages/charts-spec/CARTESIAN.md</code> in the repo).
      </p>

      <Section title="Cartesian building blocks" subtitle="RFC-002 — agent-safe marks[]">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569" }}>
          <Link to="/spec/blocks">Open Blocks Playground →</Link> — three-pane spec, chart, and JSX
          editor with live validation (C138).
        </p>
        <pre
          style={{
            margin: 0,
            padding: 14,
            background: "#f8fafc",
            fontSize: 11,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {`import { Chart, validateCartesianSpec } from "@axicharts/charts-spec";

<Chart
  panel={{
    type: "cartesian",
    encoding: { x: { field: "week" } },
    marks: [
      { mark: "bar", field: "revenue", label: "Revenue" },
      { mark: "line", field: "target", label: "Target" },
      { mark: "rule", value: 50, label: "Quota" },
    ],
  }}
  data={rows}
/>

validateCartesianSpec(panel, { rows }); // throws before render if invalid`}
        </pre>
      </Section>

      <Section title="Panel compiler" subtitle="JSON spec → React">
        <div style={{ maxWidth: 640, marginBottom: 16 }}>
          <Chart panel={SPEC_PANEL} data={SPEC_PANEL_DATA} />
        </div>
        <pre
          style={{
            margin: 0,
            padding: 14,
            background: "#f8fafc",
            fontSize: 11,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {PANEL_CODE}
        </pre>
      </Section>

      <Section title="Profile planner" subtitle="tags → template + panels">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569" }}>
          Suggested template: <code>{suggestedTemplate}</code> ·{" "}
          {plannedPanels.length} panels planned ·{" "}
          <Link to="#phase-3-planner">Phase 3 dashboard planner ↓</Link>
        </p>
        <pre
          style={{
            margin: "0 0 16px",
            padding: 14,
            background: "#0f172a",
            color: "#e2e8f0",
            fontSize: 11,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {JSON.stringify({ template: suggestedTemplate, panels: plannedPanels }, null, 2)}
        </pre>
        <pre
          style={{
            margin: 0,
            padding: 14,
            background: "#f8fafc",
            fontSize: 11,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {PLANNER_CODE}
        </pre>
      </Section>

      <Section title="Phase 3 dashboard planner" subtitle="@axicharts/charts-planner" id="phase-3-planner">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", maxWidth: 640, lineHeight: 1.6 }}>
          The profile planner above maps metrics to panels. Phase 3{" "}
          <code>@axicharts/charts-planner</code> adds natural-language intent for full dashboard
          plans — template, layout, live <code>feed</code>, and presentation mode. Dashboarder share
          exports persist planner <code>meta</code> for import.
        </p>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "8px 6px" }}>Feed</th>
              <th style={{ padding: "8px 6px" }}>Sample intent</th>
              <th style={{ padding: "8px 6px" }}>Fixture</th>
            </tr>
          </thead>
          <tbody>
            {PLANNER_FEED_ROWS.slice(0, 3).map((row) => (
              <tr key={row.feed} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 6px" }}>
                  <code>{row.feed}</code>
                </td>
                <td style={{ padding: "8px 6px", color: "#475569", fontSize: 12 }}>
                  {row.intentSample}
                </td>
                <td style={{ padding: "8px 6px", fontSize: 12 }}>
                  <Link to={`/runtime/import?preset=${row.presetId}`}>{row.presetId}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569" }}>
          <Link to="/runtime/import#planner-feeds">Full planner feed index</Link>
          {" · "}
          <Link to="/runtime#planner-http">HTTP API</Link>
          {" · "}
          <Link to="/start#planner-cli">CLI on Getting started</Link>
          {" · "}
          <Link to="/start#share-import">Share ↔ import</Link>
          {" · "}
          <Link to="/runtime/schema#share-meta">Schema § meta</Link>
        </p>
        <pre
          style={{
            margin: 0,
            padding: 14,
            background: "#0f172a",
            color: "#e2e8f0",
            fontSize: 11,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {PHASE3_PLANNER_CODE}
        </pre>
      </Section>

      <Section title="Eject to JSX" subtitle="printable Layer 1">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569" }}>
          First planned panel (<code>{plannedPanels[0]?.title}</code>) ejected:
        </p>
        <pre
          style={{
            margin: 0,
            padding: 14,
            background: "#f8fafc",
            fontSize: 11,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {ejected}
        </pre>
      </Section>

      <Section title="Third-party compilers" subtitle="registerSpecCompiler">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", maxWidth: 640 }}>
          Extend panel planning and compilation without forking core — compilers run before{" "}
          <code>compilePanel</code> and during <code>planPanelsFromProfile</code>.
        </p>
        <pre
          style={{
            margin: 0,
            padding: 14,
            background: "#f8fafc",
            fontSize: 11,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {COMPILER_CODE}
        </pre>
      </Section>

      <Section title="CLI" subtitle="charts-spec">
        <pre
          style={{
            margin: 0,
            padding: 14,
            background: "#0f172a",
            color: "#e2e8f0",
            fontSize: 12,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {`npx @axicharts/charts-spec plan profile.json
npx @axicharts/charts-spec eject panel.json`}
        </pre>
      </Section>
    </div>
  );
}
