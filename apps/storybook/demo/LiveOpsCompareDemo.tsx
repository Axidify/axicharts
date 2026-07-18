import type { ReactElement } from "react";
import { ChartContainer, LineChart } from "@axicharts/charts";
import { industrialTheme } from "@axicharts/charts-theme";
import {
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatMetric,
  type LivePanelState,
  type LiveBenchState,
  useLiveOpsBench,
} from "./liveBench";

const PUBLISHED_P95 = {
  axicharts: 2.9,
  recharts: 54.3,
};

function PanelShell({
  label,
  value,
  warn,
  children,
}: {
  label: string;
  value: string;
  warn?: boolean;
  children: ReactElement;
}): ReactElement {
  return (
    <div
      style={{
        border: warn ? "1px solid #b45309" : "1px solid #334155",
        borderRadius: 8,
        padding: "8px 10px",
        background: warn ? "rgba(120, 53, 15, 0.12)" : "#0f172a",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
          gap: 8,
        }}
      >
        <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
        <span
          style={{
            fontSize: 11,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            color: warn ? "#fbbf24" : "#e2e8f0",
          }}
        >
          {value}
        </span>
      </div>
      {children}
    </div>
  );
}

function AxiPanel({ panel, height }: { panel: LivePanelState; height: number }): ReactElement {
  const last = panel.values[panel.values.length - 1] ?? 0;
  const warn = panel.spec.id === "errors" && last > 4;

  return (
    <PanelShell
      label={panel.spec.label}
      value={formatMetric(panel.spec, last)}
      warn={warn}
    >
      <ChartContainer
        theme={industrialTheme}
        mode="live"
        height={height}
        width="100%"
      >
        <LineChart
          categories={panel.categories}
          series={[
            {
              name: panel.spec.label,
              data: panel.values,
              tone: panel.spec.tone,
            },
          ]}
          showAxes={false}
          fill
        />
      </ChartContainer>
    </PanelShell>
  );
}

function RechartsPanel({
  panel,
  height,
  width,
}: {
  panel: LivePanelState;
  height: number;
  width: number;
}): ReactElement {
  const last = panel.values[panel.values.length - 1] ?? 0;
  const warn = panel.spec.id === "errors" && last > 4;
  const data = panel.categories.map((category, index) => ({
    x: category,
    y: panel.values[index] ?? 0,
  }));

  return (
    <PanelShell
      label={panel.spec.label}
      value={formatMetric(panel.spec, last)}
      warn={warn}
    >
      <RechartsLineChart width={width} height={height} data={data}>
        <XAxis dataKey="x" hide />
        <YAxis hide domain={["auto", "auto"]} />
        <Line
          type="monotone"
          dataKey="y"
          stroke={panel.spec.stroke}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </RechartsLineChart>
    </PanelShell>
  );
}

function MetricPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}): ReactElement {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid #334155",
        background: "#0f172a",
      }}
    >
      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          color: accent ?? "#e2e8f0",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export type LiveOpsCompareDemoProps = {
  pointCount?: number;
  hz?: number;
  panelHeight?: number;
};

export function LiveOpsCompareDemo({
  pointCount = 2000,
  hz = 5,
  panelHeight = 88,
}: LiveOpsCompareDemoProps): ReactElement {
  const bench = useLiveOpsBench(pointCount, hz);
  const panelWidth = 220;

  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 1120 }}>
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, color: "#f8fafc" }}>
            Live ops wall — 6 panels × {pointCount.toLocaleString()} pts @ {hz} Hz
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", maxWidth: 640 }}>
            Same synthetic telemetry stream, same React update loop (`flushSync`). AxiCharts uses
            uPlot canvas; Recharts uses SVG. Published Chromium 4× p95:{" "}
            <strong style={{ color: "#60a5fa" }}>{PUBLISHED_P95.axicharts} ms</strong> vs{" "}
            <strong style={{ color: "#f87171" }}>{PUBLISHED_P95.recharts} ms</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={bench.toggle}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #475569",
            background: bench.running ? "#1e293b" : "#0f172a",
            color: "#e2e8f0",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {bench.running ? "Pause stream" : "Resume stream"}
        </button>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        <MetricPill
          label="AxiCharts live p95 (this tab)"
          value={`${bench.p95Ms.toFixed(2)} ms`}
          accent="#60a5fa"
        />
        <MetricPill label="Last frame" value={`${bench.frameMs.toFixed(2)} ms`} />
        <MetricPill
          label="Published AxiCharts p95"
          value={`${PUBLISHED_P95.axicharts} ms`}
          accent="#60a5fa"
        />
        <MetricPill
          label="Published Recharts p95"
          value={`${PUBLISHED_P95.recharts} ms`}
          accent="#f87171"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        <CompareColumn
          title="AxiCharts"
          subtitle="uPlot canvas · mode=live"
          accent="#2563eb"
          bench={bench}
          panelHeight={panelHeight}
          renderPanel={(panel) => (
            <AxiPanel key={panel.spec.id} panel={panel} height={panelHeight} />
          )}
        />
        <CompareColumn
          title="Recharts"
          subtitle="SVG LineChart · isAnimationActive=false"
          accent="#64748b"
          bench={bench}
          panelHeight={panelHeight}
          renderPanel={(panel) => (
            <RechartsPanel
              key={panel.spec.id}
              panel={panel}
              height={panelHeight}
              width={panelWidth}
            />
          )}
        />
      </div>
    </div>
  );
}

function CompareColumn({
  title,
  subtitle,
  accent,
  bench,
  panelHeight,
  renderPanel,
}: {
  title: string;
  subtitle: string;
  accent: string;
  bench: LiveBenchState;
  panelHeight: number;
  renderPanel: (panel: LivePanelState) => ReactElement;
}): ReactElement {
  return (
    <section>
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: accent,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{subtitle}</div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          padding: 12,
          borderRadius: 12,
          border: "1px solid #334155",
          background: "#020617",
        }}
      >
        {bench.panels.map((panel) => renderPanel(panel))}
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 11, color: "#64748b" }}>
        Panel height {panelHeight}px · {bench.pointCount.toLocaleString()} points per series
      </p>
    </section>
  );
}
