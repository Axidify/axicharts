import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Bar,
  BarChart,
  Cell,
  ChartContainer,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "@axicharts/charts";
import { cleanTheme, createTheme } from "@axicharts/charts-theme";

const WEEKS = ["W1", "W2", "W3", "W4", "W5"];
const DATA = WEEKS.map((week, index) => ({
  week,
  throughput: [120, 90, 150, 110, 180][index]!,
  aboveTarget: [120, 90, 150, 110, 180][index]! >= 150,
}));

const TARGET = 150;

function BarCellDemo(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 560 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Composable — Recharts-style Cell per category
        </div>
        <ChartContainer theme={cleanTheme} height={220} width="100%">
          <BarChart data={DATA} showValues valueSuffix=" req/min">
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="throughput">
              {DATA.map((row) => (
                <Cell
                  key={row.week}
                  dataKey={row.week}
                  fill={row.throughput >= TARGET ? "#16a34a" : "#d97706"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Brand fork — createTheme overrides
        </div>
        <ChartContainer
          theme={createTheme(cleanTheme, {
            name: "acme",
            bar: { radius: 8, gap: 0.32 },
            line: { strokeWidth: 2.5, curve: "monotone" },
          })}
          height={220}
          width="100%"
        >
          <BarChart
            categories={WEEKS}
            series={[{ name: "Throughput", data: DATA.map((row) => row.throughput) }]}
            showValues
            valueSuffix=" req/min"
            referenceLines={[{ value: TARGET, label: "Target", tone: "warning" }]}
          />
        </ChartContainer>
      </div>
    </div>
  );
}

const meta = {
  title: "Charts/BarCell",
  component: BarCellDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Granular bar styling — per-category Cell fills (Recharts parity) and createTheme brand forks. Spec compiler: encoding.color field for AI-driven fills.",
      },
    },
  },
} satisfies Meta<typeof BarCellDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PerCategoryFills: Story = {
  render: () => <BarCellDemo />,
};
