import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Chart, ejectPanel, type PanelSpec } from "@axicharts/charts-spec";
import { ChartContainer, PieChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";
import throughputSpec from "../../../../packages/charts-spec/examples/throughput-bar-color.panel.json";
import areaSloSpec from "../../../../packages/charts-spec/examples/area-slo-line.panel.json";
import revenueLineSpec from "../../../../packages/charts-spec/examples/revenue-line.panel.json";
import { docBodyStyle, docCardStyle, docColors, docRadii } from "../styles/docTokens";

const THROUGHPUT_ROWS = [
  { week: "W1", throughput: 120, aboveTarget: true },
  { week: "W2", throughput: 90, aboveTarget: false },
  { week: "W3", throughput: 150, aboveTarget: true },
  { week: "W4", throughput: 110, aboveTarget: false },
  { week: "W5", throughput: 180, aboveTarget: true },
];

const LATENCY_ROWS = [
  { day: "Mon", latency: 42, meets_slo: true },
  { day: "Tue", latency: 58, meets_slo: false },
  { day: "Wed", latency: 35, meets_slo: true },
  { day: "Thu", latency: 72, meets_slo: false },
  { day: "Fri", latency: 48, meets_slo: true },
];

const REVENUE_ROWS = [
  { day: "Mon", revenue: 4200 },
  { day: "Tue", revenue: 3800 },
  { day: "Wed", revenue: 5100 },
  { day: "Thu", revenue: 4600 },
  { day: "Fri", revenue: 5900 },
];

const PIE_SLICES = [
  { name: "Chrome", value: 48 },
  { name: "Safari", value: 28 },
  { name: "Firefox", value: 14 },
  { name: "Other", value: 10 },
];

const codeBlock = {
  padding: 14,
  borderRadius: docRadii.md,
  fontSize: 11,
  lineHeight: 1.5,
  overflow: "auto" as const,
  background: "#0f172a",
  color: "#e2e8f0",
};

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactElement;
}): ReactElement {
  return (
    <div style={{ ...docCardStyle(), padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: docColors.muted, marginBottom: 12 }}>{subtitle}</div>
      {children}
    </div>
  );
}

export function ShadcnPage(): ReactElement {
  const barSpec = throughputSpec as PanelSpec;
  const ejectedBar = ejectPanel(barSpec, "rows");

  return (
    <div>
      <div style={{ ...docCardStyle(), padding: 24, marginBottom: 24 }}>
        <h1 style={{ marginTop: 0 }}>shadcn Charts migration gallery</h1>
        <p style={docBodyStyle()}>
          Port shadcn/ui Charts and Recharts admin patterns to AxiCharts without losing{" "}
          <code>chartConfig</code>, per-mark <code>Cell</code> fills, or spec JSON for AI
          planners. Same renderer path for hand-authored JSX and <code>compilePanel</code>.
        </p>
        <ul style={{ ...docBodyStyle(), marginBottom: 0 }}>
          <li>
            <strong>Composable JSX</strong> — <code>ChartContainer</code> + chart children (not an
            option blob)
          </li>
          <li>
            <strong>Spec + eject</strong> — panel JSON compiles and ejects to Layer 1 JSX with Cell
            fills preserved
          </li>
          <li>
            <strong>Live canvas</strong> — uPlot path for cartesian when dashboards need 5–10 Hz (
            <Link to="/compare" style={{ color: docColors.accent }}>
              compare demo
            </Link>
            )
          </li>
        </ul>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <ChartCard title="Bar — encoding.color" subtitle="shadcn ColoredBar pattern via spec JSON">
          <Chart panel={barSpec} data={THROUGHPUT_ROWS} />
        </ChartCard>

        <ChartCard title="Area — per-point color" subtitle="SLO segmentation on area marks">
          <Chart panel={areaSloSpec as PanelSpec} data={LATENCY_ROWS} />
        </ChartCard>

        <ChartCard title="Line — revenue trend" subtitle="Basic area line + currency ticks">
          <Chart panel={revenueLineSpec as PanelSpec} data={REVENUE_ROWS} />
        </ChartCard>

        <ChartCard title="Donut — browser share" subtitle="PieChart with innerRadius (ECharts adapter)">
          <ChartContainer theme={cleanTheme} height={200} width="100%">
            <PieChart slices={PIE_SLICES} innerRadius={42} showLabels />
          </ChartContainer>
        </ChartCard>
      </div>

      <div style={{ ...docCardStyle(), padding: 20, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Spec JSON → eject JSX</h2>
        <p style={docBodyStyle()}>
          Example: <code>throughput-bar-color.panel.json</code> ejects composable Cell fills — same
          path as <code>compilePanel</code>.
        </p>
        <pre style={{ ...codeBlock, maxHeight: 240 }}>{ejectedBar}</pre>
      </div>

      <div style={{ ...docCardStyle(), padding: 20 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Community templates</h2>
        <p style={docBodyStyle()}>
          Third-party dashboard layouts register at runtime — no charts-spec fork. See{" "}
          <code>packages/charts-spec/examples/community-template.example.md</code> and Storybook{" "}
          <strong>Spec/Template gallery → CommunitySlot</strong>.
        </p>
        <pre style={codeBlock}>{`import { registerDashboardTemplate } from "@axicharts/charts-spec";

registerDashboardTemplate({
  id: "my-saas-overview",
  label: "My SaaS overview",
  vertical: "custom",
  render: () => <MyDashboardLayout />,
});`}</pre>
      </div>
    </div>
  );
}
