import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, LineChart, Stat } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LATENCY = [42, 38, 55, 49, 62, 58, 71];
const P50 = [34, 31, 40, 38, 44, 41, 49];
const ERROR_RATE = [0.8, 0.6, 1.1, 0.9, 1.4, 1.0, 1.2];

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

function Sparkline({
  data,
  tone = "default",
}: {
  data: number[];
  tone?: "default" | "success" | "warning";
}): ReactElement {
  return (
    <ChartContainer theme={cleanTheme} height={36} width="100%">
      <LineChart
        categories={DAYS}
        series={[{ name: "trend", data, tone }]}
        fill
        showAxes={false}
      />
    </ChartContainer>
  );
}

function CleanDefaultMockup(): ReactElement {
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
          API p95 latency
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
            gap: 10,
          }}
        >
          <KpiTile>
            <Stat value="71 ms" label="p95" surface="light" />
            <Sparkline data={LATENCY} tone="warning" />
          </KpiTile>
          <KpiTile>
            <Stat value="49 ms" label="p50" tone="success" surface="light" />
            <Sparkline data={P50} tone="success" />
          </KpiTile>
          <KpiTile>
            <Stat value="+4.1%" label="vs last week" tone="warning" surface="light" />
            <Sparkline data={ERROR_RATE} tone="default" />
          </KpiTile>
        </div>

        <div style={{ marginTop: 16 }}>
          <ChartContainer theme={cleanTheme} height={180} width="100%">
            <LineChart
              categories={DAYS}
              series={[{ name: "p95 latency", data: LATENCY }]}
              fill
              valueSuffix=" ms"
            />
          </ChartContainer>
          <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
            Source: metrics · Mon–Sun · p95 latency (ms) · Y: latency (ms), X:
            day
          </p>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Mockups/G · Clean Default",
  component: CleanDefaultMockup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Round 3 acceptance target (5/5) — cleanTheme card, KPI tiles with inline sparklines, freshness chip, filled line chart, caption.",
      },
    },
  },
} satisfies Meta<typeof CleanDefaultMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ApiLatency: Story = {
  render: () => <CleanDefaultMockup />,
};
