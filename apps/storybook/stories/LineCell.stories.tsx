import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Area,
  AreaChart,
  Cell,
  ChartContainer,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const WEEKS = ["W1", "W2", "W3", "W4", "W5"];
const DATA = WEEKS.map((week, index) => ({
  week,
  latency: [42, 58, 35, 72, 48][index]!,
  aboveSlo: [42, 58, 35, 72, 48][index]! <= 50,
}));

const SLO = 50;

function LineCellDemo(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 560 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Line — per-point Cell stroke + dots
        </div>
        <ChartContainer theme={cleanTheme} height={220} width="100%">
          <LineChart data={DATA}>
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="latency">
              {DATA.map((row) => (
                <Cell
                  key={row.week}
                  dataKey={row.week}
                  fill={row.latency <= SLO ? "#16a34a" : "#dc2626"}
                />
              ))}
            </Line>
          </LineChart>
        </ChartContainer>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Line — segmented color + monotone curve (Recharts parity)
        </div>
        <ChartContainer theme={cleanTheme} height={220} width="100%">
          <LineChart data={DATA}>
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="latency" type="monotone">
              {DATA.map((row) => (
                <Cell
                  key={row.week}
                  dataKey={row.week}
                  fill={row.latency <= SLO ? "#16a34a" : "#dc2626"}
                />
              ))}
            </Line>
          </LineChart>
        </ChartContainer>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Area — segmented fill under curve
        </div>
        <ChartContainer theme={cleanTheme} height={220} width="100%">
          <AreaChart data={DATA}>
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Area dataKey="latency" type="monotone">
              {DATA.map((row) => (
                <Cell
                  key={row.week}
                  dataKey={row.week}
                  tone={row.latency <= SLO ? "success" : "critical"}
                />
              ))}
            </Area>
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}

const meta = {
  title: "Charts/LineCell",
  component: LineCellDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Granular line/area styling — per-category Cell colors for segments and points, including monotone curves with segmented stroke (C79). Spec compiler: encoding.color on line/area panels.",
      },
    },
  },
} satisfies Meta<typeof LineCellDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PerPointColors: Story = {
  render: () => <LineCellDemo />,
};
