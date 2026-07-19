import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { ChartContainer, LineChart } from "@axicharts/charts";
import { QuickLineChart } from "@axicharts/charts/quick";
import { cleanTheme, createTheme } from "@axicharts/charts-theme";
import { docBodyStyle } from "../styles/docTokens";

const QUICK_CODE = `import { QuickLineChart } from "@axicharts/charts/quick";

export function LatencySparkline() {
  return (
    <QuickLineChart
      data={[42, 38, 55, 49, 62, 58, 71]}
      labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
      title="p95 latency"
    />
  );
}`;

const THEME_CODE = `import { cleanTheme, createTheme } from "@axicharts/charts-theme";

export const brandTheme = createTheme(cleanTheme, {
  name: "acme",
  bar: { radius: 8 },
});`;

const GROW_CODE = `import {
  ChartContainer,
  LineChart,
  type ChartCategoryInput,
  type ChartPointerEvent,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

export function LatencyPanel() {
  return (
    <ChartContainer theme={cleanTheme} minHeight={280}>
      <LineChart
        categories={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
        series={[{ name: "p95", data: [42, 38, 55, 49, 62, 58, 71] }]}
        fill
      />
    </ChartContainer>
  );
}`;

const FILTER_CODE = `import { useState } from "react";
import {
  ChartContainer,
  LineChart,
  type ChartCategoryInput,
  type ChartPointerEvent,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

type WeekMeta = { date: string };

const DAYS: ChartCategoryInput<WeekMeta>[] = [
  { label: "Mon", meta: { date: "2026-07-13" } },
  { label: "Tue", meta: { date: "2026-07-14" } },
  // …
];

export function WeekFilterChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onCategoryClick = (e: ChartPointerEvent<WeekMeta>) => {
    setActiveIndex(e.categoryIndex);
    // e.meta?.date — typed, no cast
  };

  return (
    <ChartContainer theme={cleanTheme} minHeight={280}>
      <LineChart
        categories={DAYS}
        series={[{ name: "Throughput", data: [12, 8, 15, 10, 14] }]}
        fill
        selectedCategoryIndex={activeIndex ?? undefined}
        onCategoryClick={onCategoryClick}
      />
    </ChartContainer>
  );
}`;

const codeBlock = (bg: string, color: string) => ({
  padding: 14,
  borderRadius: 8,
  fontSize: 11,
  lineHeight: 1.5,
  overflow: "auto" as const,
  background: bg,
  color,
});

export function StartPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Start here</h1>
      <p style={docBodyStyle()}>
        One themed line chart in ~15 minutes. No spec layer, no planner, no ECharts peer.{" "}
        <Link to="/guides/choosing-your-path">Not sure which path?</Link>
      </p>

      <h2 style={{ fontSize: 16 }}>1. Install (line-only)</h2>
      <pre style={codeBlock("#0f172a", "#e2e8f0")}>
        {`pnpm add @axicharts/charts @axicharts/charts-theme uplot`}
      </pre>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        Peers: <code>react</code>, <code>react-dom</code>, <code>uplot</code>. See{" "}
        <Link to="/guides/imports">import cheat sheet</Link>.
      </p>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>2. Hello world</h2>
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 16,
          background: "#fff",
          maxWidth: 640,
        }}
      >
        <QuickLineChart
          data={[42, 38, 55, 49, 62, 58, 71]}
          labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          title="p95 latency"
        />
      </div>
      <pre style={{ ...codeBlock("#f1f5f9", "#0f172a"), marginTop: 12 }}>{QUICK_CODE}</pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>3. Theme</h2>
      <pre style={codeBlock("#f1f5f9", "#0f172a")}>{THEME_CODE}</pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>4. Layout + grow</h2>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        <code>ChartContainer</code> needs <code>minHeight</code> or <code>height</code> in flex/grid.
      </p>
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 16,
          background: "#fff",
          maxWidth: 640,
        }}
      >
        <ChartContainer theme={cleanTheme} minHeight={200}>
          <LineChart
            categories={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            series={[{ name: "p95", data: [42, 38, 55, 49, 62, 58, 71] }]}
            fill
          />
        </ChartContainer>
      </div>
      <pre style={{ ...codeBlock("#f1f5f9", "#0f172a"), marginTop: 12 }}>{GROW_CODE}</pre>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>5. Chart as filter</h2>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        Category clicks replace a separate chip row. Zeros still emit — skip drilldowns in your
        handler when <code>value === 0</code> or the week is flat (app policy).
      </p>
      <pre style={{ ...codeBlock("#f1f5f9", "#0f172a") }}>{FILTER_CODE}</pre>

      <p style={{ ...docBodyStyle(), marginTop: 20, fontSize: 13 }}>
        Scaffold:{" "}
        <code>npx @axicharts/charts create-dashboard my-app --category cartesian</code>
      </p>

      <hr style={{ margin: "40px 0", border: "none", borderTop: "1px solid #e2e8f0" }} />

      <h2 id="advanced" style={{ fontSize: 16 }}>
        Advanced
      </h2>
      <p style={docBodyStyle()}>
        Add these when you need agents, portable JSON, or chart breadth beyond cartesian.
      </p>
      <ul style={{ fontSize: 14, lineHeight: 1.8, color: "#475569" }}>
        <li>
          <Link to="/guides/csv-dashboard">CSV → dashboard</Link> — upload → planner → per-panel{" "}
          <code>Chart</code> (Path 2)
        </li>
        <li>
          <Link to="/spec/blocks">Cartesian spec + validation</Link> — <code>marks[]</code>,{" "}
          <code>validateCartesianSpec</code>, <code>ejectPanel</code>
        </li>
        <li>
          <Link to="/shadcn">Recharts / shadcn migration</Link> — registry, <code>chartConfig</code>
        </li>
        <li>
          <Link to="/compare">Live ops compare</Link> — 5–10 Hz canvas vs Recharts SVG
        </li>
        <li>
          <Link to="/runtime">Dashboard runtime + embed</Link> — mosaic, adapters, share/import
        </li>
      </ul>

      <h2 id="architecture" style={{ fontSize: 16, marginTop: 28 }}>
        Architecture
      </h2>
      <p style={{ ...docBodyStyle(), fontSize: 13 }}>
        <Link to="/packages">All packages</Link> ·{" "}
        <Link to="/spec">Spec layer</Link> ·{" "}
        <Link to="/plugins">Community plugins</Link> ·{" "}
        <a
          href="https://github.com/Axidify/Dashboarder/tree/main/docs/charts"
          target="_blank"
          rel="noreferrer"
        >
          Product RFCs (Dashboarder)
        </a>
      </p>
    </div>
  );
}
