import type { ReactElement, ReactNode } from "react";
import {
  Chart,
  ejectPanel,
  planPanelsFromProfile,
  suggestTemplate,
} from "@axicharts/charts-spec";
import { SPEC_PANEL, SPEC_PANEL_DATA, SPEC_PROFILE } from "../demos/specDemo";

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
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section
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
        for full control.
      </p>

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
          {plannedPanels.length} panels planned
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
