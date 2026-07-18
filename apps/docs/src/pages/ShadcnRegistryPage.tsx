import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { docBodyStyle, docCardStyle, docColors, docRadii } from "../styles/docTokens";

const REGISTRY_BASE = "https://axidify.github.io/axicharts/registry";

const ITEMS = [
  {
    name: "chart-axi-bar",
    title: "Bar chart",
    description: "ChartContainer + BarChart + chartConfig — multi-series admin bar.",
  },
  {
    name: "chart-axi-line",
    title: "Line chart (area fill)",
    description: "LineChart with fill — revenue / trend dashboards.",
  },
  {
    name: "chart-axi-donut",
    title: "Donut chart",
    description: "PieChart with innerRadius — browser-share style slices.",
  },
  {
    name: "chart-axi-area",
    title: "Area chart",
    description: "AreaChart — SLO / latency trend with chartConfig labels.",
  },
  {
    name: "chart-axi-stacked-bar",
    title: "Stacked bar chart",
    description: "BarChart stacked — sprint velocity / multi-series totals.",
  },
  {
    name: "chart-axi-combo",
    title: "Combo chart (bar + line)",
    description: "ComboChart mixed bar + line — shadcn ComposedChart migration path.",
  },
  {
    name: "chart-axi-multi-line",
    title: "Multi-line chart",
    description: "Multi-series LineChart with chartConfig — burndown / trend comparison.",
  },
  {
    name: "chart-axi-chart-config",
    title: "chartConfig helper (lib)",
    description: "Shared ChartConfig labels/colors — import into your chart blocks.",
  },
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

export function ShadcnRegistryPage(): ReactElement {
  return (
    <div>
      <div style={{ ...docCardStyle(), padding: 24, marginBottom: 24 }}>
        <h1 style={{ marginTop: 0 }}>shadcn custom registry</h1>
        <p style={docBodyStyle()}>
          Install AxiCharts chart blocks into an existing shadcn/ui project via the{" "}
          <a
            href="https://ui.shadcn.com/docs/registry/getting-started"
            style={{ color: docColors.accent }}
            target="_blank"
            rel="noreferrer"
          >
            custom registry
          </a>{" "}
          URL. Components are thin wrappers around <code>ChartContainer</code> — no duplicated
          chart logic.
        </p>
        <p style={{ ...docBodyStyle(), marginBottom: 0 }}>
          <Link to="/shadcn" style={{ color: docColors.accent }}>
            Migration gallery
          </Link>
          {" · "}
          <Link to="/compare" style={{ color: docColors.accent }}>
            vs Recharts
          </Link>
          {" · "}
          <a href={`${REGISTRY_BASE}/registry.json`} style={{ color: docColors.accent }}>
            registry.json
          </a>
        </p>
      </div>

      <div style={{ ...docCardStyle(), padding: 20, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>1. Init shadcn (if needed)</h2>
        <pre style={codeBlock}>{`npx shadcn@latest init`}</pre>
      </div>

      <div style={{ ...docCardStyle(), padding: 20, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>2. Install peer dependencies</h2>
        <p style={docBodyStyle()}>
          Registry items declare <code>@axicharts/charts</code> and{" "}
          <code>@axicharts/charts-theme</code>. Your app also needs adapter peers:
        </p>
        <pre style={codeBlock}>{`npm install @axicharts/charts @axicharts/charts-theme echarts uplot react react-dom`}</pre>
        <p style={{ ...docBodyStyle(), marginBottom: 0, fontSize: 13 }}>
          Copy <code>tokens.css</code> from <code>@axicharts/charts-theme</code> (or map your
          existing shadcn <code>--chart-*</code> CSS variables).
        </p>
      </div>

      <div style={{ ...docCardStyle(), padding: 20, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>3. Add a registry item</h2>
        <p style={docBodyStyle()}>
          Point the shadcn CLI at the hosted registry item JSON (GitHub Pages after docs deploy):
        </p>
        <pre style={codeBlock}>{`npx shadcn@latest add ${REGISTRY_BASE}/chart-axi-bar.json`}</pre>
        <p style={{ ...docBodyStyle(), fontSize: 13 }}>
          Optional: add a namespaced registry in <code>components.json</code> so you can run{" "}
          <code>npx shadcn@latest add @axicharts/chart-axi-bar</code>:
        </p>
        <pre style={{ ...codeBlock, marginTop: 12 }}>{`{
  "registries": [
    {
      "name": "axicharts",
      "url": "${REGISTRY_BASE}/{name}.json"
    }
  ]
}`}</pre>
      </div>

      <div style={{ ...docCardStyle(), padding: 20, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Available items</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {ITEMS.map((item) => (
            <div
              key={item.name}
              style={{
                border: `1px solid ${docColors.border}`,
                borderRadius: docRadii.md,
                padding: 14,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: docColors.muted, marginBottom: 8 }}>
                {item.description}
              </div>
              <pre style={{ ...codeBlock, margin: 0, fontSize: 10 }}>
                {`npx shadcn@latest add ${REGISTRY_BASE}/${item.name}.json`}
              </pre>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...docCardStyle(), padding: 20 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Source</h2>
        <p style={{ ...docBodyStyle(), marginBottom: 0 }}>
          Registry source lives in <code>registry/</code> at the axicharts repo root. Run{" "}
          <code>node scripts/build-registry.mjs</code> to regenerate{" "}
          <code>apps/docs/public/registry/</code> before docs deploy. See also{" "}
          <code>packages/charts-spec/examples/shadcn-registry/LAUNCH.md</code>.
        </p>
      </div>
    </div>
  );
}
