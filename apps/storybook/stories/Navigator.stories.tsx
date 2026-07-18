import type { Meta, StoryObj } from "@storybook/react";
import {
  AreaChart,
  BarChart,
  ChartContainer,
  ChartNavigator,
  CHART_NAVIGATOR_HEIGHT,
  ChartSyncGroup,
  LineChart,
} from "@axicharts/charts";
import { cleanTheme, liveTheme } from "@axicharts/charts-theme";

const DAY_COUNT = 90;
const CATEGORIES = Array.from({ length: DAY_COUNT }, (_, index) => {
  const date = new Date("2026-01-01T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + index);
  return date.toISOString().slice(0, 10);
});
const THROUGHPUT = CATEGORIES.map(
  (_, index) => 40 + Math.round(Math.sin(index / 4) * 18) + index * 0.6,
);
const ERROR_RATE = CATEGORIES.map(
  (_, index) => 1.2 + Math.abs(Math.cos(index / 5)) * 2.5,
);
const LATENCY = CATEGORIES.map(
  (_, index) => 32 + Math.round(Math.sin(index / 6) * 12) + index * 0.3,
);

function PanelLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "#64748b",
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  );
}

function OpsNavigatorDashboard() {
  return (
    <ChartSyncGroup>
      <div
        style={{
          display: "grid",
          gap: 14,
          maxWidth: 820,
          padding: 16,
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <header>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            Ops wall — range navigator
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            C112 polish — preset pills, overview drag guard, follower sync
          </div>
        </header>
        <div>
          <PanelLabel>Navigator leader</PanelLabel>
          <ChartContainer theme={cleanTheme} height={CHART_NAVIGATOR_HEIGHT} syncId="nav">
            <ChartNavigator
              categories={CATEGORIES}
              series={[{ name: "Throughput", data: THROUGHPUT }]}
              initialPreset="1M"
              minRangePercent={4}
            />
          </ChartContainer>
        </div>
        <div>
          <PanelLabel>Throughput (follower)</PanelLabel>
          <ChartContainer theme={cleanTheme} height={220} syncId="throughput" syncFollower="nav">
            <BarChart
              categories={CATEGORIES}
              series={[{ name: "Throughput", data: THROUGHPUT }]}
              showValues
            />
          </ChartContainer>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <PanelLabel>Error rate</PanelLabel>
            <ChartContainer theme={cleanTheme} height={160} syncId="errors" syncFollower="nav">
              <LineChart
                categories={CATEGORIES}
                series={[{ name: "Error rate", data: ERROR_RATE, tone: "warning" }]}
                valueSuffix="%"
                fill
              />
            </ChartContainer>
          </div>
          <div>
            <PanelLabel>p95 latency</PanelLabel>
            <ChartContainer theme={cleanTheme} height={160} syncId="latency" syncFollower="nav">
              <AreaChart
                categories={CATEGORIES}
                series={[{ name: "p95 latency", data: LATENCY, tone: "info" }]}
                valueSuffix="ms"
              />
            </ChartContainer>
          </div>
        </div>
      </div>
    </ChartSyncGroup>
  );
}

const INTRADAY = Array.from({ length: 78 }, (_, index) => {
  const totalMinutes = 9 * 60 + 30 + index * 5;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});
const PRICE = INTRADAY.map((_, index) =>
  Number((182 + Math.sin(index / 6) * 2.4 + index * 0.02).toFixed(2)),
);
const RSI = INTRADAY.map((_, index) =>
  Math.round(42 + Math.sin(index / 5) * 14),
);

function TradingNavigatorDashboard() {
  return (
    <ChartSyncGroup>
      <div
        style={{
          display: "grid",
          gap: 12,
          maxWidth: 760,
          padding: 12,
          borderRadius: 10,
          border: "1px solid #334155",
          background: "#0f172a",
        }}
      >
        <ChartContainer
          theme={liveTheme}
          mode="live"
          height={CHART_NAVIGATOR_HEIGHT}
          syncId="nav"
        >
          <ChartNavigator
            categories={INTRADAY}
            series={[{ name: "AAPL", data: PRICE }]}
            initialPreset="1D"
          />
        </ChartContainer>
        <ChartContainer
          theme={liveTheme}
          mode="live"
          height={240}
          syncId="price"
          syncFollower="nav"
        >
          <LineChart
            categories={INTRADAY}
            series={[{ name: "AAPL", data: PRICE }]}
            fill
          />
        </ChartContainer>
        <ChartContainer
          theme={liveTheme}
          mode="live"
          height={120}
          syncId="rsi"
          syncFollower="nav"
        >
          <LineChart
            categories={INTRADAY}
            series={[{ name: "RSI", data: RSI, tone: "warning" }]}
            referenceLines={[
              { value: 70, label: "OB", tone: "critical" },
              { value: 30, label: "OS", tone: "success" },
            ]}
          />
        </ChartContainer>
      </div>
    </ChartSyncGroup>
  );
}

const meta = {
  title: "Charts/Navigator",
  component: OpsNavigatorDashboard,
  parameters: {
    docs: {
      description: {
        component:
          "C97 stock navigator + C112 polish — mini overview strip + preset ranges (1D/1W/1M/ALL) publishes brush window to ChartSyncGroup; follower panels slice via syncFollower.",
      },
    },
  },
} satisfies Meta<typeof OpsNavigatorDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpsMultiPanel: Story = {
  render: () => <OpsNavigatorDashboard />,
};

export const TradingDesk: Story = {
  render: () => <TradingNavigatorDashboard />,
};
