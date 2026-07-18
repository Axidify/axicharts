import { useEffect, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  ChartSyncGroup,
  HeatmapChart,
  LineChart,
  type HeatmapMatrix,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const SYMBOLS = ["AAPL", "MSFT", "GOOG", "AMZN", "META"];
const HOURS = Array.from({ length: 24 }, (_, index) => `${index}:00`);

function buildMatrix(seed = 0): HeatmapMatrix {
  const values = SYMBOLS.map((_, row) =>
    HOURS.map((_, col) => {
      const base = Math.sin((row + seed) / 2 + col / 4) * 0.35 + 0.5;
      return Math.max(0, Math.min(1, base));
    }),
  );

  return {
    xCategories: HOURS,
    yCategories: SYMBOLS,
    values,
  };
}

const INITIAL_MATRIX = buildMatrix(0);

function HeatmapGaDemo(): ReactElement {
  const [matrix, setMatrix] = useState(INITIAL_MATRIX);

  useEffect(() => {
    let tick = 0;
    const timer = window.setInterval(() => {
      tick += 1;
      setMatrix(buildMatrix(tick));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ maxWidth: 720 }}>
      <ChartContainer theme={cleanTheme} height={360} width="100%" mode="live">
        <HeatmapChart
          matrix={matrix}
          min={0}
          max={1}
          showLabels
          cellFormatter={(value) => value.toFixed(2)}
        />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        C93 heatmap GA — axis labels, cell labels, theme visual map, and live cell updates @ 1 Hz
      </p>
    </div>
  );
}

function HeatmapBrushFollowerDemo(): ReactElement {
  const categories = HOURS;
  const throughput = categories.map((_, index) => 40 + Math.round(Math.sin(index / 3) * 18));

  return (
    <ChartSyncGroup>
      <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
        <ChartContainer theme={cleanTheme} height={180} syncId="session">
          <LineChart
            brush
            brushEnd={35}
            categories={categories}
            series={[{ name: "Session volume", data: throughput }]}
          />
        </ChartContainer>
        <ChartContainer
          theme={cleanTheme}
          height={280}
          syncId="corr"
          syncFollower="session"
        >
          <HeatmapChart matrix={INITIAL_MATRIX} min={0} max={1} showLabels />
        </ChartContainer>
      </div>
    </ChartSyncGroup>
  );
}

const meta = {
  title: "Charts/Heatmap",
  component: HeatmapGaDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C93 Heatmap GA — axis labels, cell labels, encoding-driven spec compile, brush follower slicing via ChartSyncGroup.",
      },
    },
  },
} satisfies Meta<typeof HeatmapGaDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GaLive: Story = {
  render: () => <HeatmapGaDemo />,
};

export const BrushFollower: Story = {
  render: () => <HeatmapBrushFollowerDemo />,
};
