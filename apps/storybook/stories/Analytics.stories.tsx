import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, ParallelChart, ThemeRiverChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const OPS_DIMENSIONS = [
  { name: "CPU %", field: "cpu", max: 100 },
  { name: "Memory %", field: "memory", max: 100 },
  { name: "Latency ms", field: "latency", max: 50 },
  { name: "Error rate", field: "errors", max: 10 },
  { name: "Queue depth", field: "queue", max: 200 },
];

const OPS_SERIES = [
  { name: "api-east-1", tone: "info" as const, values: [62, 71, 18, 1.2, 84] },
  { name: "api-west-2", tone: "success" as const, values: [48, 58, 12, 0.6, 52] },
  { name: "worker-pool", tone: "warning" as const, values: [88, 82, 34, 3.8, 164] },
  { name: "batch-jobs", tone: "default" as const, values: [35, 44, 8, 0.2, 28] },
];

const THEME_RIVER_POINTS = [
  { time: "2026-01-01", value: 42, series: "API" },
  { time: "2026-01-01", value: 28, series: "Workers" },
  { time: "2026-01-01", value: 18, series: "Batch" },
  { time: "2026-01-08", value: 48, series: "API" },
  { time: "2026-01-08", value: 32, series: "Workers" },
  { time: "2026-01-08", value: 22, series: "Batch" },
  { time: "2026-01-15", value: 55, series: "API" },
  { time: "2026-01-15", value: 36, series: "Workers" },
  { time: "2026-01-15", value: 19, series: "Batch" },
  { time: "2026-01-22", value: 61, series: "API" },
  { time: "2026-01-22", value: 41, series: "Workers" },
  { time: "2026-01-22", value: 24, series: "Batch" },
];

function AnalyticsWall(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 960 }}>
      <div>
        <ChartContainer theme={cleanTheme} height={300} width="100%">
          <ParallelChart dimensions={OPS_DIMENSIONS} series={OPS_SERIES} />
        </ChartContainer>
        <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
          C107 ParallelChart — multi-dimensional ops host comparison via ECharts parallel coordinates
        </p>
      </div>
      <div>
        <ChartContainer theme={cleanTheme} height={260} width="100%">
          <ThemeRiverChart points={THEME_RIVER_POINTS} />
        </ChartContainer>
        <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
          C107 ThemeRiverChart — workload mix over time via ECharts theme river
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: "Charts/Analytics",
  component: AnalyticsWall,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C107 analytics vertical — ParallelChart + ThemeRiverChart with spec `type: parallel` / `type: theme-river` compile/eject.",
      },
    },
  },
} satisfies Meta<typeof AnalyticsWall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ParallelAndThemeRiver: Story = {
  render: () => <AnalyticsWall />,
};
