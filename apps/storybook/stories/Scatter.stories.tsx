import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, ScatterChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const HOLDINGS = [
  { name: "AAPL", risk: 0.22, return: 0.18 },
  { name: "MSFT", risk: 0.19, return: 0.16 },
  { name: "NVDA", risk: 0.41, return: 0.52 },
  { name: "JPM", risk: 0.24, return: 0.11 },
  { name: "XOM", risk: 0.28, return: 0.09 },
  { name: "UNH", risk: 0.17, return: 0.13 },
  { name: "TSLA", risk: 0.48, return: 0.31 },
  { name: "PG", risk: 0.12, return: 0.07 },
];

const BENCHMARKS = [
  { name: "S&P 500", risk: 0.16, return: 0.1 },
  { name: "NASDAQ", risk: 0.21, return: 0.14 },
  { name: "Small cap", risk: 0.27, return: 0.12 },
];

function RiskReturnScatter(): ReactElement {
  return (
    <div style={{ maxWidth: 520 }}>
      <ChartContainer theme={cleanTheme} height={320} width="100%">
        <ScatterChart
          series={[
            {
              name: "Holdings",
              tone: "info",
              points: HOLDINGS.map((item) => ({
                x: item.risk,
                y: item.return,
                label: item.name,
              })),
            },
            {
              name: "Benchmarks",
              tone: "default",
              points: BENCHMARKS.map((item) => ({
                x: item.risk,
                y: item.return,
                label: item.name,
              })),
            },
          ]}
          xSuffix=""
          ySuffix=""
        />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Risk vs return — hover points for labels; multi-series legend
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Scatter",
  component: RiskReturnScatter,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C2 ScatterChart — quantitative x/y via ECharts with React tooltip overlay.",
      },
    },
  },
} satisfies Meta<typeof RiskReturnScatter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RiskReturn: Story = {
  render: () => <RiskReturnScatter />,
};
