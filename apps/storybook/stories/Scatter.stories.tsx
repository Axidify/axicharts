import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, ScatterChart } from "@axicharts/charts";
import { Chart } from "@axicharts/charts-spec";
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

const MARKET_CAP_BUBBLES = [
  { symbol: "AAPL", risk: 0.22, returnPct: 0.18, marketCap: 2800 },
  { symbol: "MSFT", risk: 0.19, returnPct: 0.16, marketCap: 3100 },
  { symbol: "NVDA", risk: 0.41, returnPct: 0.52, marketCap: 2200 },
  { symbol: "JPM", risk: 0.24, returnPct: 0.11, marketCap: 580 },
  { symbol: "XOM", risk: 0.28, returnPct: 0.09, marketCap: 430 },
  { symbol: "UNH", risk: 0.17, returnPct: 0.13, marketCap: 510 },
  { symbol: "TSLA", risk: 0.48, returnPct: 0.31, marketCap: 760 },
  { symbol: "PG", risk: 0.12, returnPct: 0.07, marketCap: 390 },
  { symbol: "AMZN", risk: 0.31, returnPct: 0.22, marketCap: 1900 },
  { symbol: "GOOGL", risk: 0.26, returnPct: 0.19, marketCap: 1800 },
  { symbol: "META", risk: 0.35, returnPct: 0.27, marketCap: 1250 },
  { symbol: "BRK", risk: 0.15, returnPct: 0.08, marketCap: 890 },
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
          xLabel="Risk"
          yLabel="Return %"
        />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Risk vs return — hover points for labels; multi-series legend
      </p>
    </div>
  );
}

function MarketCapBubbleWall(): ReactElement {
  return (
    <div style={{ maxWidth: 720 }}>
      <header style={{ marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
          Portfolio bubble map
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
          Bubble radius encodes market cap; labels hide on overlap in dense regions.
        </p>
      </header>
      <Chart
        panel={{
          type: "scatter",
          title: "Risk / return / market cap",
          encoding: {
            x: { field: "risk", label: "Risk" },
            y: { field: "returnPct", label: "Return" },
            size: { field: "marketCap", range: [8, 26] },
          },
          props: {
            xLabel: "Risk (σ)",
            yLabel: "Return %",
            showPointLabels: true,
            showSizeLegend: true,
            labelField: "symbol",
          },
        }}
        data={MARKET_CAP_BUBBLES}
        theme="clean"
        height={360}
        width="100%"
      />
    </div>
  );
}

function CompactScatterTile(): ReactElement {
  return (
    <ChartContainer theme={cleanTheme} height={120} width="100%">
      <ScatterChart
        series={[
          {
            name: "Holdings",
            points: HOLDINGS.map((item) => ({
              x: item.risk,
              y: item.return,
              label: item.name,
            })),
          },
        ]}
        showAxes={false}
        showPointLabels
        xLabel="Risk"
        yLabel="Return"
      />
    </ChartContainer>
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
          "C115 ScatterChart polish — compact axis labels, bubble size encoding, overlap-aware point labels.",
      },
    },
  },
} satisfies Meta<typeof RiskReturnScatter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RiskReturn: Story = {
  render: () => <RiskReturnScatter />,
};

export const MarketCapBubble: Story = {
  render: () => <MarketCapBubbleWall />,
};

export const CompactTile: Story = {
  render: () => <CompactScatterTile />,
};
