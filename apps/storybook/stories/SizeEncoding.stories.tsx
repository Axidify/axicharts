import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Bar,
  BarChart,
  Cell,
  ChartContainer,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "@axicharts/charts";
import { Chart } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";

const WEEKS = ["W1", "W2", "W3", "W4", "W5"];
const DATA = WEEKS.map((week, index) => ({
  week,
  throughput: [120, 90, 150, 110, 180][index]!,
  volume: [10, 30, 50, 25, 45][index]!,
  latency: [42, 58, 35, 72, 48][index]!,
  weight: [1, 3, 5, 2, 4][index]!,
}));

function SizeEncodingDemo(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 560 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Spec — encoding.size bar width by volume
        </div>
        <Chart
          panel={{
            type: "bar",
            title: "Throughput by week",
            encoding: {
              x: { field: "week", type: "nominal" },
              y: { field: "throughput", type: "quantitative" },
              size: { field: "volume", type: "quantitative" },
            },
            props: { showValues: true },
            valueSuffix: " req/min",
          }}
          data={DATA}
          theme="clean"
          height={220}
        />
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Spec — encoding.size point radius on line
        </div>
        <Chart
          panel={{
            type: "line",
            encoding: {
              x: { field: "week", type: "nominal" },
              y: { field: "latency", type: "quantitative" },
              size: { field: "weight", type: "quantitative", range: [4, 12] },
            },
          }}
          data={DATA}
          theme="clean"
          height={220}
        />
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Composable — Cell size per category
        </div>
        <ChartContainer theme={cleanTheme} height={220} width="100%">
          <BarChart data={DATA} showValues valueSuffix=" req/min">
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="throughput">
              {DATA.map((row) => (
                <Cell
                  key={row.week}
                  dataKey={row.week}
                  size={0.4 + (row.volume / 50) * 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Composable — variable point radius
        </div>
        <ChartContainer theme={cleanTheme} height={220} width="100%">
          <LineChart data={DATA}>
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Line dataKey="latency">
              {DATA.map((row) => (
                <Cell
                  key={row.week}
                  dataKey={row.week}
                  radius={4 + row.weight * 1.5}
                />
              ))}
            </Line>
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}

const meta = {
  title: "Charts/SizeEncoding",
  component: SizeEncodingDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "encoding.size — bar width fraction or point radius scaled from a data field. Composable Cell size/radius for hand-authored charts.",
      },
    },
  },
} satisfies Meta<typeof SizeEncodingDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BarAndLine: Story = {
  render: () => <SizeEncodingDemo />,
};
