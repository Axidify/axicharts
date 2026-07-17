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

function KpiTile({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  return (
    <div
      style={{
        background: "#f1f5f9",
        borderRadius: 8,
        padding: "12px 14px",
      }}
    >
      {children}
    </div>
  );
}

function KpiChartMockup(): ReactElement {
  return (
    <div style={{ maxWidth: 520 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <KpiTile>
          <Stat value="12.4k" label="Requests today" surface="light" />
        </KpiTile>
        <KpiTile>
          <Stat
            value="99.2%"
            label="Success rate"
            tone="success"
            surface="light"
          />
        </KpiTile>
      </div>

      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          background: "#ffffff",
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
            Throughput trend
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
              background: "#f1f5f9",
              color: "#64748b",
            }}
          >
            7 days
          </span>
        </div>

        <div style={{ padding: 16 }}>
          <ChartContainer theme={cleanTheme} height={110} width="100%">
            <LineChart
              categories={DAYS}
              series={[{ name: "req/min", data: DAILY_THROUGHPUT }]}
              fill
              valueSuffix=" req/min"
            />
          </ChartContainer>

          <div style={{ marginTop: 14 }}>
            <ChartContainer theme={cleanTheme} height={100} width="100%">
              <BarChart
                categories={WEEKS}
                series={[{ name: "Weekly total", data: WEEKLY_TOTALS }]}
                showValues
              />
            </ChartContainer>
          </div>

          <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
            Source: gateway · line: daily req/min · bars: weekly totals with
            labels
          </p>
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
          "Round 2 acceptance target — Tremor KPI tiles + line/bar combo with full chart chrome.",
      },
    },
  },
} satisfies Meta<typeof KpiChartMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThroughputDashboard: Story = {
  render: () => <KpiChartMockup />,
};
