import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import {
  ChartContainer,
  LineChart,
  Stat,
  type ChartDataState,
} from "@axicharts/charts";
import { cleanTheme, industrialTheme } from "@axicharts/charts-theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const VALUES = [42, 38, 55, 49, 62, 58, 71];

function StatePanel({
  dataState,
  message,
}: {
  dataState: ChartDataState;
  message?: string;
}): ReactElement {
  return (
    <ChartContainer
      theme={cleanTheme}
      height={200}
      width="100%"
      dataState={dataState}
      loadingMessage={message}
      emptyMessage={message}
      errorMessage={message}
    >
      <LineChart
        categories={DAYS}
        series={[{ name: "Throughput", data: VALUES }]}
        fill
      />
    </ChartContainer>
  );
}

function StaleLivePanel(): ReactElement {
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now() - 8000);

  useEffect(() => {
    const refresh = window.setInterval(() => {
      setLastUpdatedAt(Date.now());
    }, 12000);
    return () => window.clearInterval(refresh);
  }, []);

  const stale = Date.now() - lastUpdatedAt >= 5000;

  return (
    <div style={{ maxWidth: 520 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          fontSize: 12,
          color: "#94a3b8",
        }}
      >
        <span>prod-api-01 · error rate</span>
        <Stat
          value="3/min"
          label="errors"
          tone="warning"
          monospace
          stale={stale}
        />
      </div>
      <ChartContainer
        theme={industrialTheme}
        mode="live"
        height={160}
        width="100%"
        staleAfterMs={5000}
        lastUpdatedAt={lastUpdatedAt}
      >
        <LineChart
          categories={DAYS}
          series={[{ name: "errors/min", data: VALUES, tone: "warning" }]}
          fill
        />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
        Data refreshes every 12s · stale after 5s without update
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Chart State",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C2 data state overlays and live stale treatment — use dataState, staleAfterMs, and lastUpdatedAt on ChartContainer.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  render: () => <StatePanel dataState="loading" />,
};

export const Empty: Story = {
  render: () => <StatePanel dataState="empty" message="No samples in range" />,
};

export const Error: Story = {
  render: () => (
    <StatePanel dataState="error" message="Historian request failed" />
  ),
};

export const StaleLive: Story = {
  render: () => <StaleLivePanel />,
};
