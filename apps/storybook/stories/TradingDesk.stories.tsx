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

const BAR_COUNT = 48;
const SESSIONS = Array.from({ length: BAR_COUNT }, (_, index) => {
  const totalMinutes = 9 * 60 + 30 + index;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

let price = 182.4;
const OHLC = SESSIONS.map(() => {
  const open = price;
  const delta = (Math.random() - 0.48) * 1.2;
  const close = open + delta;
  const high = Math.max(open, close) + Math.random() * 0.6;
  const low = Math.min(open, close) - Math.random() * 0.6;
  price = close;
  return {
    open: Number(open.toFixed(2)),
    high: Number(high.toFixed(2)),
    low: Number(low.toFixed(2)),
    close: Number(close.toFixed(2)),
  };
});
const VOLUME = SESSIONS.map(() =>
  Number((0.8 + Math.random() * 2.2).toFixed(1)) * 1_000_000,
);
const RSI = SESSIONS.map((_, index) =>
  Math.round(35 + Math.sin(index / 4) * 12 + (Math.random() - 0.5) * 8),
);

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
                brush
                brushEnd={45}
              />
            </ChartContainer>
            <p style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>
              OHLC + volume · drag slider or scroll to zoom
            </p>
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
          "Trading vertical — OHLC + volume with brush/zoom, synced RSI panel, live stat strip, correlation heatmap.",
      },
    },
  },
} satisfies Meta<typeof TradingDeskMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IntradayPanel: Story = {
  render: () => <TradingDeskMockup />,
};
