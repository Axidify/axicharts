import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Chart, ejectPanel, type PanelSpec } from "@axicharts/charts-spec";
import throughputSpec from "../../../../packages/charts-spec/examples/throughput-bar-color.panel.json";
import areaSloSpec from "../../../../packages/charts-spec/examples/area-slo-line.panel.json";
import revenueLineSpec from "../../../../packages/charts-spec/examples/revenue-line.panel.json";
import revenueChartConfigSpec from "../../../../packages/charts-spec/examples/revenue-line-chartconfig.panel.json";
import donutSpec from "../../../../packages/charts-spec/examples/browser-share-donut.panel.json";
import stackedBarSpec from "../../../../packages/charts-spec/examples/velocity-stacked-bar.panel.json";
import multiLineSpec from "../../../../packages/charts-spec/examples/burndown-multi-line.panel.json";
import { docBodyStyle, docCardStyle, docColors, docRadii } from "../styles/docTokens";

const STORYBOOK_SHADCN_GALLERY =
  "http://localhost:6006/?path=/story/charts-shadcnparity--gallery";
const STORYBOOK_RECHARTS_COMPARE =
  "http://localhost:6006/?path=/story/compare-recharts-vs-axicharts--granular-bar-cells";

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

const BROWSER_SHARE_ROWS = [
  { name: "Chrome", value: 48 },
  { name: "Safari", value: 28 },
  { name: "Firefox", value: 14 },
  { name: "Other", value: 10 },
];

const INSTALL_BLOCK = `npm install @axicharts/charts @axicharts/charts-theme echarts uplot`;

const MINIMAL_JSX = `import { ChartContainer, BarChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const chartConfig = {
  desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
};

export function WeeklyThroughput() {
  return (
    <ChartContainer theme={cleanTheme} height={220} config={chartConfig}>
      <BarChart
        categories={["Mon", "Tue", "Wed", "Thu", "Fri"]}
        series={[{ name: "desktop", data: [120, 90, 150, 110, 180] }]}
      />
    </ChartContainer>
  );
}`;

const MIGRATION_ROWS = [
  ["ResponsiveContainer", "ChartContainer", "theme, height, width, config"],
  ["BarChart / LineChart / AreaChart", "BarChart / LineChart / AreaChart", "Same composable children"],
  ["XAxis, YAxis, CartesianGrid", "Built into ChartContainer", "Theme tokens + formatters"],
  ["Tooltip, Legend", "ChartContainer variants", "tooltipVariant, legendVariant"],
  ["chartConfig", "ChartContainer config", "Also on panel spec props.chartConfig"],
  ["<Bar><Cell fill /></Bar>", "encoding.color or Cell JSX", "ejectPanel preserves Cell fills"],
  ["PieChart + innerRadius", "PieChart innerRadius or type: donut", "compilePanel + ECharts adapter"],
  ["stacked prop on BarChart", "stacked on panel spec", "Multi-series via props.series"],
  ["Recharts data prop", "categories + series or row data", "Chart panel={spec} data={rows}"],
] as const;

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
  const chartConfigSpec = revenueChartConfigSpec as PanelSpec;
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
        <ul style={{ ...docBodyStyle(), marginBottom: 12 }}>
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
        <p style={{ ...docBodyStyle(), marginBottom: 0, fontSize: 13 }}>
          <Link to="/shadcn/registry" style={{ color: docColors.accent }}>
            shadcn custom registry install
          </Link>
          {" · "}
          <Link to="/compare" style={{ color: docColors.accent }}>
            Live ops wall (/compare)
          </Link>
          {" · "}
          <a href={STORYBOOK_SHADCN_GALLERY} style={{ color: docColors.accent }}>
            Storybook — ShadcnParity Gallery
          </a>
          {" · "}
          <a href={STORYBOOK_RECHARTS_COMPARE} style={{ color: docColors.accent }}>
            Storybook — Recharts vs AxiCharts
          </a>
          {" · "}
          <Link to="/templates/community" style={{ color: docColors.accent }}>
            Community templates
          </Link>
        </p>
      </div>

      <div style={{ ...docCardStyle(), padding: 20, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Install + minimal JSX</h2>
        <pre style={{ ...codeBlock, marginBottom: 12 }}>{INSTALL_BLOCK}</pre>
        <pre style={codeBlock}>{MINIMAL_JSX}</pre>
      </div>

      <div style={{ ...docCardStyle(), padding: 20, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Migration checklist — Recharts → AxiCharts</h2>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <thead>
              <tr style={{ borderBottom: `2px solid ${docColors.border}`, textAlign: "left" }}>
                <th style={{ padding: "8px 12px" }}>Recharts / shadcn</th>
                <th style={{ padding: "8px 12px" }}>AxiCharts</th>
                <th style={{ padding: "8px 12px" }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {MIGRATION_ROWS.map(([recharts, axi, notes]) => (
                <tr key={recharts} style={{ borderBottom: `1px solid ${docColors.border}` }}>
                  <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 12 }}>
                    {recharts}
                  </td>
                  <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 12 }}>
                    {axi}
                  </td>
                  <td style={{ padding: "8px 12px", color: docColors.muted }}>{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <ChartCard
          title="chartConfig — revenue line"
          subtitle="revenue-line-chartconfig.panel.json — labels/colors on ChartContainer"
        >
          <Chart panel={chartConfigSpec} data={REVENUE_ROWS} />
        </ChartCard>

        <ChartCard title="Bar — encoding.color" subtitle="shadcn ColoredBar pattern via spec JSON">
          <Chart panel={barSpec} data={THROUGHPUT_ROWS} />
        </ChartCard>

        <ChartCard title="Area — per-point color" subtitle="SLO segmentation on area marks">
          <Chart panel={areaSloSpec as PanelSpec} data={LATENCY_ROWS} />
        </ChartCard>

        <ChartCard title="Line — revenue trend" subtitle="Basic area line + currency ticks">
          <Chart panel={revenueLineSpec as PanelSpec} data={REVENUE_ROWS} />
        </ChartCard>

        <ChartCard title="Donut — browser share" subtitle="type: donut + innerRadius via compilePanel">
          <Chart panel={donutSpec as PanelSpec} data={BROWSER_SHARE_ROWS} />
        </ChartCard>

        <ChartCard title="Stacked bar — sprint velocity" subtitle="stacked + multi-series props">
          <Chart panel={stackedBarSpec as PanelSpec} data={[]} />
        </ChartCard>

        <ChartCard title="Multi-series line — burndown" subtitle="Ideal vs remaining series">
          <Chart panel={multiLineSpec as PanelSpec} data={[]} />
        </ChartCard>
      </div>

      <div style={{ ...docCardStyle(), padding: 20, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Spec JSON → eject JSX</h2>
        <p style={docBodyStyle()}>
          Example: <code>throughput-bar-color.panel.json</code> ejects composable Cell fills — same
          path as <code>compilePanel</code>. Install via{" "}
          <Link to="/shadcn/registry" style={{ color: docColors.accent }}>
            shadcn custom registry
          </Link>{" "}
          (<code>registry/</code> at repo root).
        </p>
        <pre style={{ ...codeBlock, maxHeight: 240 }}>{ejectedBar}</pre>
      </div>

      <div style={{ ...docCardStyle(), padding: 20 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Community templates</h2>
        <p style={docBodyStyle()}>
          Third-party dashboard layouts register at runtime — no charts-spec fork. See the{" "}
          <Link to="/templates/community" style={{ color: docColors.accent }}>
            community templates guide
          </Link>
          , <code>packages/charts-spec/examples/community-template.example.md</code>, and Storybook{" "}
          <strong>Spec/Template gallery → CommunitySlot</strong>.
        </p>
      </div>
    </div>
  );
}
