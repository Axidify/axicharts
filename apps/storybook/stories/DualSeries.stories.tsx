import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, LineChart, Stat } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LATENCY = [42, 38, 55, 49, 62, 58, 71];
const ERRORS = [1, 2, 5, 3, 2, 4, 3];
const ERROR_SLO = 4;

function formatDelta(current: number, previous: number, suffix = ""): string {
  if (previous === 0) return `0${suffix}`;
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}%${suffix}`;
}

function KpiTile({ children }: { children: ReactElement }): ReactElement {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "10px 12px",
      }}
    >
      {children}
    </div>
  );
}

function SeriesChip({
  label,
  color,
}: {
  label: string;
  color: string;
}): ReactElement {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 10,
        color: "#64748b",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 999,
        padding: "3px 8px",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: color,
        }}
      />
      {label}
    </span>
  );
}

function DualSeriesMockup(): ReactElement {
  const latencyPeak = Math.max(...LATENCY);
  const errorsPeak = Math.max(...ERRORS);
  const latencyLatest = LATENCY[LATENCY.length - 1] ?? 0;
  const latencyPrev = LATENCY[LATENCY.length - 2] ?? latencyLatest;
  const errorsLatest = ERRORS[ERRORS.length - 1] ?? 0;
  const errorsPrev = ERRORS[ERRORS.length - 2] ?? errorsLatest;
  const wedCorrelation = ERRORS[2] === errorsPeak && LATENCY[2] >= 50;

  return (
    <div
      style={{
        maxWidth: 520,
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        background: "#ffffff",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "12px 16px",
          borderBottom: "1px solid #e2e8f0",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
          Latency vs errors
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <SeriesChip label="p95 latency" color="#3b82f6" />
          <SeriesChip label="errors/min" color="#f59e0b" />
        </div>
        <span
          style={{
            fontSize: 11,
            color: "#64748b",
            background: "#f1f5f9",
            borderRadius: 999,
            padding: "3px 8px",
          }}
        >
          Last 7 days
        </span>
      </div>

      <div style={{ padding: 16 }}>
        {wedCorrelation ? (
          <div
            style={{
              marginBottom: 12,
              fontSize: 11,
              color: "#9a3412",
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: 8,
              padding: "8px 10px",
            }}
          >
            Wed correlation — latency and error peaks aligned (55 ms · 5/min)
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <KpiTile>
            <Stat value={`${latencyPeak} ms`} label="p95 peak" surface="light" />
            <div style={{ marginTop: 6, fontSize: 10, color: "#64748b" }}>
              Sun {formatDelta(latencyLatest, latencyPrev)}
            </div>
          </KpiTile>
          <KpiTile>
            <Stat
              value={`${errorsPeak}/min`}
              label="error peak"
              tone="warning"
              surface="light"
              stale={errorsPeak >= ERROR_SLO}
            />
            <div style={{ marginTop: 6, fontSize: 10, color: "#b45309" }}>
              Sun {formatDelta(errorsLatest, errorsPrev)}
            </div>
          </KpiTile>
        </div>

        <div style={{ marginTop: 14 }}>
          <ChartContainer theme={cleanTheme} height={200} width="100%">
            <LineChart
              categories={DAYS}
              series={[
                { name: "p95 latency", data: LATENCY, tone: "info" },
                { name: "errors/min", data: ERRORS, tone: "warning" },
              ]}
              fill
              dualAxis="auto"
              valueSuffix=" ms"
              referenceLines={[
                { value: ERROR_SLO, label: "Error SLO", tone: "warning" },
              ]}
            />
          </ChartContainer>
          <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
            Source: APM + logs · Mon–Sun · dual Y-scale auto · error SLO reference
            on secondary axis · hover for tooltip
          </p>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Mockups/J · Dual Series",
  component: DualSeriesMockup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Round 3 acceptance target (5/5) — dual-axis KPI tiles, series legend chips, correlation callout, error SLO reference line, stale stat on breach.",
      },
    },
  },
} satisfies Meta<typeof DualSeriesMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LatencyVsErrors: Story = {
  render: () => <DualSeriesMockup />,
};
