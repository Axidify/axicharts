import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AreaChart,
  ChartContainer,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "@axicharts/charts";
import { cleanTheme, createTheme } from "@axicharts/charts-theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LATENCY = [42, 38, 55, 49, 62, 58, 71];
const ROWS = DAYS.map((day, index) => ({
  day,
  p95: LATENCY[index]!,
}));

function LineCurveDemo(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 560 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Monotone (default) — Recharts-style smooth curves
        </div>
        <ChartContainer theme={cleanTheme} height={180} width="100%">
          <LineChart
            categories={DAYS}
            series={[{ name: "p95 latency", data: LATENCY }]}
            fill
            valueSuffix=" ms"
          />
        </ChartContainer>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Linear — straight segments between points
        </div>
        <ChartContainer
          theme={createTheme(cleanTheme, {
            name: "linear-demo",
            line: { curve: "linear" },
          })}
          height={180}
          width="100%"
        >
          <LineChart
            categories={DAYS}
            series={[{ name: "p95 latency", data: LATENCY }]}
            fill
            valueSuffix=" ms"
          />
        </ChartContainer>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Composable — Line type=&quot;monotone&quot; (Recharts parity)
        </div>
        <ChartContainer theme={cleanTheme} height={180} width="100%">
          <LineChart data={ROWS} fill valueSuffix=" ms">
            <XAxis dataKey="day" />
            <YAxis />
            <Line dataKey="p95" type="monotone" />
          </LineChart>
        </ChartContainer>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Chart-level override — curve=&quot;linear&quot; on smooth theme
        </div>
        <ChartContainer theme={cleanTheme} height={160} width="100%">
          <AreaChart
            categories={DAYS}
            series={[{ name: "p95", data: LATENCY }]}
            curve="linear"
          />
        </ChartContainer>
      </div>
    </div>
  );
}

const meta = {
  title: "Charts/LineCurve",
  component: LineCurveDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Smooth monotone curves (Recharts type=\"monotone\") via theme.line.curve, createTheme, composable Line type, or LineChart curve prop.",
      },
    },
  },
} satisfies Meta<typeof LineCurveDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MonotoneVsLinear: Story = {
  render: () => <LineCurveDemo />,
};
