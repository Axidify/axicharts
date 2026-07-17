import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, LineChart, Stat } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LATENCY = [42, 38, 55, 49, 62, 58, 71];

function CleanDefaultMockup(): ReactElement {
  return (
    <div
      style={{
        maxWidth: 520,
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
          API p95 latency
        </span>
        <span style={{ fontSize: 12, color: "#64748b" }}>Last 7 days</span>
      </div>

      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
          }}
        >
          <Stat value="71 ms" label="p95" surface="light" />
          <Stat value="49 ms" label="p50" tone="success" surface="light" />
          <Stat value="+4.1%" label="vs last week" tone="warning" surface="light" />
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
          "Round 2 acceptance target — cleanTheme card, 3-up stat strip, filled line chart, caption.",
      },
    },
  },
} satisfies Meta<typeof CleanDefaultMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ApiLatency: Story = {
  render: () => <CleanDefaultMockup />,
};
