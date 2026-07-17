import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  CandlestickChart,
  ChartContainer,
  ChartSyncGroup,
  HeatmapChart,
  LineChart,
  Stat,
} from "@axicharts/charts";
import { liveTheme } from "@axicharts/charts-theme";

const SESSIONS = ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00"];
const OHLC = [
  { open: 182.4, high: 183.2, low: 181.9, close: 182.8 },
  { open: 182.8, high: 184.1, low: 182.5, close: 183.6 },
  { open: 183.6, high: 183.9, low: 182.1, close: 182.4 },
  { open: 182.4, high: 185.0, low: 182.2, close: 184.7 },
  { open: 184.7, high: 185.4, low: 184.0, close: 184.2 },
  { open: 184.2, high: 184.8, low: 183.5, close: 184.0 },
];
const VOLUME = [1.2, 1.8, 1.1, 2.4, 1.6, 1.3].map((v) => v * 1_000_000);
const RSI = [38, 42, 35, 58, 52, 48];

const HEATMAP = {
  xCategories: ["Tech", "Energy", "Finance", "Health"],
  yCategories: ["Tech", "Energy", "Finance", "Health"],
  values: [
    [1.0, 0.42, 0.61, 0.38],
    [0.42, 1.0, 0.55, 0.29],
    [0.61, 0.55, 1.0, 0.47],
    [0.38, 0.29, 0.47, 1.0],
  ],
};

function TradingDeskMockup(): ReactElement {
  return (
    <div
      style={{
        maxWidth: 820,
        border: "1px solid #1e293b",
        borderRadius: 8,
        background: "#0f172a",
        color: "#e2e8f0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid #334155",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600 }}>AAPL · intraday</span>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Live · 1m bars</span>
      </div>

      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 12,
          }}
        >
          <Stat value="184.00" label="Last" surface="dark" monospace />
          <Stat value="+0.98%" label="Change" tone="success" surface="dark" monospace />
          <Stat value="2.4M" label="Volume" surface="dark" monospace />
          <Stat value="42" label="RSI" tone="warning" surface="dark" monospace />
        </div>

        <ChartSyncGroup>
          <div style={{ marginTop: 16 }}>
            <ChartContainer
              theme={liveTheme}
              mode="live"
              syncId="ohlc"
              height={280}
              width="100%"
            >
              <CandlestickChart
                categories={SESSIONS}
                data={OHLC}
                volume={VOLUME}
              />
            </ChartContainer>
          </div>

          <div style={{ marginTop: 12 }}>
            <ChartContainer
              theme={liveTheme}
              mode="live"
              syncId="rsi"
              height={120}
              width="100%"
            >
              <LineChart
                categories={SESSIONS}
                series={[{ name: "RSI", data: RSI, tone: "warning" }]}
                fill
              />
            </ChartContainer>
            <p style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>
              RSI (14) · synced crosshair with OHLC panel
            </p>
          </div>
        </ChartSyncGroup>

        <div style={{ marginTop: 16 }}>
          <ChartContainer theme={liveTheme} height={200} width="100%">
            <HeatmapChart matrix={HEATMAP} min={0} max={1} />
          </ChartContainer>
          <p style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>
            Sector correlation matrix
          </p>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Mockups/N · Trading Desk",
  component: TradingDeskMockup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Trading vertical — OHLC + volume, synced RSI panel, live stat strip, correlation heatmap.",
      },
    },
  },
} satisfies Meta<typeof TradingDeskMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IntradayPanel: Story = {
  render: () => <TradingDeskMockup />,
};
