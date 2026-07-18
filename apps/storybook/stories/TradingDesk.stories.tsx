import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  CandlestickChart,
  ChartContainer,
  ChartSyncGroup,
  DataTable,
  HeatmapChart,
  LineChart,
  Stat,
} from "@axicharts/charts";
import { liveTheme } from "@axicharts/charts-theme";

const BAR_COUNT = 56;
const SESSIONS = Array.from({ length: BAR_COUNT }, (_, index) => {
  const totalMinutes = 8 * 60 + index * 5;
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

const POSITIONS = [
  {
    symbol: "AAPL",
    side: "LONG",
    qty: 400,
    avg: "182.10",
    pnl: "+$360",
    pnlTone: "success" as const,
  },
  {
    symbol: "NVDA",
    side: "LONG",
    qty: 120,
    avg: "118.40",
    pnl: "-$84",
    pnlTone: "critical" as const,
  },
];

const LAST = OHLC[OHLC.length - 1]!;
const FIRST = OHLC[0]!;
const SESSION_HIGH = Math.max(...OHLC.map((bar) => bar.high));
const SESSION_LOW = Math.min(...OHLC.map((bar) => bar.low));
const CHANGE_PCT = ((LAST.close - FIRST.open) / FIRST.open) * 100;
const RSI_LAST = RSI[RSI.length - 1] ?? 0;
const RSI_WARN = RSI_LAST >= 70 || RSI_LAST <= 30;
const TOTAL_VOLUME = VOLUME.reduce((sum, value) => sum + value, 0);

function KpiTile({ children }: { children: ReactElement }): ReactElement {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #334155",
        borderRadius: 8,
        padding: "10px 12px",
      }}
    >
      {children}
    </div>
  );
}

function TradingDeskMockup(): ReactElement {
  return (
    <div
      style={{
        maxWidth: 820,
        border: "1px solid #1e293b",
        borderRadius: 10,
        background: "#0f172a",
        color: "#e2e8f0",
        overflow: "hidden",
        boxShadow: "0 12px 32px rgba(2, 6, 23, 0.45)",
      }}
    >
      <style>{`
        @keyframes tradingDeskLivePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.92); }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          borderBottom: "1px solid #334155",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600 }}>AAPL · intraday</span>
        <span
          style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 999,
            background: "#1e293b",
            color: "#94a3b8",
          }}
        >
          NASDAQ · extended session
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: 10,
            padding: "2px 10px",
            borderRadius: 999,
            background: "#14532d",
            color: "#86efac",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#4ade80",
              marginRight: 6,
              animation: "tradingDeskLivePulse 1.6s ease-in-out infinite",
            }}
          />
          Live
        </span>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>1m bars</span>
        <span
          style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 999,
            background: "#1e293b",
            color: "#cbd5e1",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          H {SESSION_HIGH.toFixed(2)} · L {SESSION_LOW.toFixed(2)}
        </span>
      </div>

      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 10,
          }}
        >
          <KpiTile>
            <Stat value={LAST.close.toFixed(2)} label="Last" surface="dark" monospace />
          </KpiTile>
          <KpiTile>
            <Stat
              value={`${CHANGE_PCT >= 0 ? "+" : ""}${CHANGE_PCT.toFixed(2)}%`}
              label="Session"
              tone={CHANGE_PCT >= 0 ? "success" : "critical"}
              surface="dark"
              monospace
            />
          </KpiTile>
          <KpiTile>
            <Stat
              value={`${(TOTAL_VOLUME / 1_000_000).toFixed(1)}M`}
              label="Volume"
              surface="dark"
              monospace
            />
          </KpiTile>
          <KpiTile>
            <Stat
              value={String(RSI_LAST)}
              label="RSI (14)"
              tone={RSI_WARN ? "warning" : "neutral"}
              surface="dark"
              monospace
              stale={RSI_WARN}
            />
          </KpiTile>
        </div>

        <ChartSyncGroup>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              OHLC + volume
            </div>
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
                brushEnd={55}
                sessionShading="rth"
              />
            </ChartContainer>
            <p style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>
              Pre-market / after-hours shading · volume bars match candle direction ·
              brush window synced to RSI panel
            </p>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              RSI (14)
            </div>
            <ChartContainer
              theme={liveTheme}
              mode="live"
              syncId="rsi"
              syncFollower="ohlc"
              height={120}
              width="100%"
            >
              <LineChart
                categories={SESSIONS}
                series={[{ name: "RSI", data: RSI, tone: "warning" }]}
                fill
                referenceLines={[
                  { value: 70, label: "Overbought", tone: "critical" },
                  { value: 30, label: "Oversold", tone: "success" },
                ]}
              />
            </ChartContainer>
            <p style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>
              Synced crosshair with OHLC · 30/70 reference bands
            </p>
          </div>
        </ChartSyncGroup>

        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600 }}>Sector correlation</span>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>
              max pair Tech–Finance 0.61
            </span>
          </div>
          <ChartContainer theme={liveTheme} height={200} width="100%">
            <HeatmapChart matrix={HEATMAP} min={0} max={1} />
          </ChartContainer>
        </div>

        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600 }}>Open positions</span>
            <span
              style={{
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 999,
                background: "#14532d",
                color: "#86efac",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              Net P&amp;L +$276
            </span>
          </div>
          <DataTable
            columns={[
              { key: "symbol", label: "Symbol", monospace: true },
              { key: "side", label: "Side" },
              { key: "qty", label: "Qty", align: "right", monospace: true },
              { key: "avg", label: "Avg", align: "right", monospace: true },
              {
                key: "pnl",
                label: "P&L",
                align: "right",
                monospace: true,
                toneKey: "pnlTone",
              },
            ]}
            rows={POSITIONS}
            surface="dark"
            compact
            caption="Book positions · monospace P&L tones"
          />
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
          "C111 trading polish — extended session shading, directional volume bars, OHLC brush + synced RSI follower window/crosshair with 30/70 references.",
      },
    },
  },
} satisfies Meta<typeof TradingDeskMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IntradayPanel: Story = {
  render: () => <TradingDeskMockup />,
};
