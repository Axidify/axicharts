import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  BarChart,
  ChartContainer,
  LineChart,
  Stat,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKS = ["W1", "W2", "W3", "W4", "W5"];
const DAILY_THROUGHPUT = [120, 90, 150, 110, 180, 130, 145];
const WEEKLY_TOTALS = [120, 90, 150, 110, 180];
const WEEKLY_TARGET = 150;

function KpiTile({ children }: { children: ReactElement }): ReactElement {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "10px 12px",
        display: "grid",
        gap: 6,
      }}
    >
      {children}
    </div>
  );
}

function Sparkline({ data }: { data: number[] }): ReactElement {
  return (
    <ChartContainer theme={cleanTheme} height={32} width="100%">
      <LineChart
        categories={DAYS.slice(0, data.length)}
        series={[{ name: "trend", data }]}
        fill
        showAxes={false}
      />
    </ChartContainer>
  );
}

function KpiChartMockup(): ReactElement {
  const dailyLatest = DAILY_THROUGHPUT[DAILY_THROUGHPUT.length - 1] ?? 0;
  const dailyPrev = DAILY_THROUGHPUT[DAILY_THROUGHPUT.length - 2] ?? dailyLatest;
  const dailyDelta =
    dailyPrev === 0 ? 0 : ((dailyLatest - dailyPrev) / dailyPrev) * 100;
  const weeklyPeak = Math.max(...WEEKLY_TOTALS);
  const weeklyLatest = WEEKLY_TOTALS[WEEKLY_TOTALS.length - 1] ?? 0;
  const vsTarget = ((weeklyLatest - WEEKLY_TARGET) / WEEKLY_TARGET) * 100;

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
          padding: "12px 16px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
          Gateway throughput
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#64748b",
            background: "#f1f5f9",
            borderRadius: 999,
            padding: "3px 8px",
          }}
        >
          Updated 2m ago
        </span>
      </div>

      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <KpiTile>
            <Stat value="12.4k" label="Requests today" surface="light" />
            <Sparkline data={DAILY_THROUGHPUT} />
          </KpiTile>
          <KpiTile>
            <Stat
              value="99.2%"
              label="Success rate"
              tone="success"
              surface="light"
            />
            <Sparkline data={[98.8, 99.0, 98.6, 99.4, 99.1, 99.3, 99.2]} />
          </KpiTile>
          <KpiTile>
            <Stat
              value={`${weeklyPeak}`}
              label="weekly peak"
              tone="success"
              surface="light"
            />
            <div style={{ fontSize: 10, color: "#64748b" }}>
              W5 {vsTarget >= 0 ? "+" : ""}
              {vsTarget.toFixed(0)}% vs target
            </div>
          </KpiTile>
        </div>

        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: "1px solid #e2e8f0",
              background: "#f8fafc",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
              Throughput trend
            </span>
            <span
              style={{
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 999,
                background: "#ecfdf5",
                color: "#15803d",
              }}
            >
              Sun {dailyDelta >= 0 ? "+" : ""}
              {dailyDelta.toFixed(0)}% vs Sat
            </span>
          </div>

          <div style={{ padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
              Daily req/min
            </div>
            <ChartContainer theme={cleanTheme} height={110} width="100%">
              <LineChart
                categories={DAYS}
                series={[{ name: "req/min", data: DAILY_THROUGHPUT }]}
                fill
                valueSuffix=" req/min"
              />
            </ChartContainer>

            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#64748b",
                margin: "14px 0 6px",
              }}
            >
              Weekly totals
            </div>
            <ChartContainer theme={cleanTheme} height={100} width="100%">
              <BarChart
                categories={WEEKS}
                series={[{ name: "Weekly total", data: WEEKLY_TOTALS }]}
                showValues
                referenceLines={[
                  { value: WEEKLY_TARGET, label: "Target", tone: "warning" },
                ]}
              />
            </ChartContainer>

            <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
              Source: gateway · KPI sparklines + line/bar combo · weekly target
              reference on bars
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Mockups/K · KPI + Chart",
  component: KpiChartMockup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Round 3 acceptance target (5/5) — 3-up KPI tiles with sparklines, freshness chip, daily delta badge, line + bar combo with weekly target reference.",
      },
    },
  },
} satisfies Meta<typeof KpiChartMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThroughputDashboard: Story = {
  render: () => <KpiChartMockup />,
};
