import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, LineChart, Stat } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LATENCY = [42, 38, 55, 49, 62, 58, 71];
const ERRORS = [1, 2, 5, 3, 2, 4, 3];

function DualSeriesMockup(): ReactElement {
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
          Latency vs errors
        </span>
        <span style={{ fontSize: 12, color: "#64748b" }}>Last 7 days</span>
      </div>

      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <Stat value="71 ms" label="p95 peak" surface="light" />
          <Stat
            value="5/min"
            label="error peak"
            tone="warning"
            surface="light"
          />
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
            />
          </ChartContainer>
          <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
            Source: APM + logs · Mon–Sun · legend: p95 latency (ms), errors/min
            · dual Y-scale auto
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
          "Round 2 acceptance target — multi-series line, legend, area fill, dual Y-axis auto, 2-up stat strip.",
      },
    },
  },
} satisfies Meta<typeof DualSeriesMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LatencyVsErrors: Story = {
  render: () => <DualSeriesMockup />,
};
