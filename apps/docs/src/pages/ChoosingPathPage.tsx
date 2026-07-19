import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { docBodyStyle, docCardStyle } from "../styles/docTokens";

const paths = [
  {
    title: "Hand-built dashboard chart",
    who: "React app, one or a few panels, you write JSX",
    steps: [
      "Install @axicharts/charts + charts-theme + uplot",
      "QuickLineChart or ChartContainer + LineChart from /cartesian",
      "createTheme(cleanTheme, …) or tokens.css",
    ],
    start: "/start",
    cta: "Getting started",
  },
  {
    title: "CSV → dynamic dashboard",
    who: "Spreadsheet upload, batch snapshot, auto panel grid",
    steps: [
      "Parse CSV → rows in your app",
      "profile.fields + planFromIntent (static feed)",
      "Chart per panel — not RuntimeDashboard for CSV",
    ],
    start: "/guides/csv-dashboard",
    cta: "CSV dashboard guide",
  },
  {
    title: "Agent / JSON cartesian spec",
    who: "LLM, MCP, or codegen emits panel JSON",
    steps: [
      "validateCartesianSpec before render",
      "type: cartesian + marks[]",
      "ejectPanel when human edits code",
    ],
    start: "/spec/blocks",
    cta: "Blocks Playground",
  },
  {
    title: "Live ops wall",
    who: "Streaming metrics, 5–10 Hz, linked brush",
    steps: [
      "mode=\"live\" + liveTheme",
      "ChartContainer in grid layout",
      "ChartSyncGroup for brush sync (optional)",
    ],
    start: "/compare",
    cta: "Live compare demo",
  },
  {
    title: "Recharts / shadcn migration",
    who: "Existing shadcn Charts or Recharts admin app",
    steps: [
      "chartConfig + Cell fills parity",
      "Registry install or ShadcnParity gallery",
      "Subpath /cartesian for bundle size",
    ],
    start: "/shadcn",
    cta: "shadcn gallery",
  },
] as const;

export function ChoosingPathPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Choosing your path</h1>
      <p style={docBodyStyle()}>
        AxiCharts is one stack with multiple entry points. Pick <strong>one</strong> — don&apos;t
        start with spec + planner + runtime unless you need them.
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {paths.map((path) => (
          <div key={path.title} style={{ ...docCardStyle(), padding: 20, boxShadow: "none" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 17 }}>{path.title}</h2>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>{path.who}</p>
            <ol style={{ margin: "0 0 16px", paddingLeft: 20, fontSize: 14, lineHeight: 1.7 }}>
              {path.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <Link to={path.start} style={{ fontSize: 14, fontWeight: 500 }}>
              {path.cta} →
            </Link>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 16, marginTop: 32 }}>Default recommendation</h2>
      <p style={docBodyStyle()}>
        Most integrators: <strong>Hand-built dashboard chart</strong> →{" "}
        <Link to="/guides/imports">import cheat sheet</Link> → grow to <code>/cartesian</code>.
        Add spec layer only when agents or portable JSON matter.
      </p>
    </div>
  );
}
