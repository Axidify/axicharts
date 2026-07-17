import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  LineChart,
  type PlotSeries,
} from "@axicharts/charts";
import { industrialTheme } from "@axicharts/charts-theme";
import { DAYS, useLiveSeries } from "./utils/liveSeries";

type CellConfig = {
  title: string;
  format: (data: number[]) => string;
  seed: number[];
  suffix?: string;
  tone?: PlotSeries["tone"];
};

const CELLS: CellConfig[] = [
  {
    title: "Latency",
    seed: [42, 38, 55, 49, 62, 58, 71],
    format: (data) => `${data[data.length - 1]?.toFixed(0)} ms`,
  },
  {
    title: "Throughput",
    seed: [120, 90, 150, 110, 180, 130, 145],
    format: (data) => {
      const value = data[data.length - 1] ?? 0;
      return value >= 1000
        ? `${(value / 1000).toFixed(1)}k/s`
        : `${value.toFixed(0)}/s`;
    },
  },
  {
    title: "Errors",
    seed: [1, 2, 5, 3, 2, 4, 3],
    format: (data) => `${data[data.length - 1]?.toFixed(1)}/min`,
    tone: "warning",
  },
  {
    title: "Queue depth",
    seed: [12, 18, 24, 20, 16, 22, 24],
    format: (data) => `${data[data.length - 1]?.toFixed(0)}`,
  },
];

function GridCell({
  title,
  stat,
  data,
  tone,
}: {
  title: string;
  stat: string;
  data: number[];
  tone?: PlotSeries["tone"];
}): ReactElement {
  return (
    <div style={{ padding: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{title}</span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{stat}</span>
      </div>
      <div style={{ marginTop: 6 }}>
        <ChartContainer
          theme={industrialTheme}
          mode="live"
          height={56}
          width="100%"
          debounceMs={16}
        >
          <LineChart
            categories={DAYS}
            series={[{ name: title, data, tone }]}
            fill
            showAxes={false}
          />
        </ChartContainer>
      </div>
    </div>
  );
}

function GridCellsMockup(): ReactElement {
  const latency = useLiveSeries(CELLS[0].seed, 5);
  const throughput = useLiveSeries(CELLS[1].seed, 5);
  const errors = useLiveSeries(CELLS[2].seed, 5);
  const queue = useLiveSeries(CELLS[3].seed, 5);

  const liveData = [latency, throughput, errors, queue];

  return (
    <div style={{ width: 320 }}>
      <div
        style={{
          border: "1px solid #1e293b",
          borderRadius: 8,
          overflow: "hidden",
          background: "#0b1220",
        }}
      >
        <div
          style={{
            padding: "6px 10px",
            borderBottom: "1px solid #334155",
            background: "#111827",
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          4-up dashboard cell · 320px · full chart chrome per tile
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          {CELLS.map((cell, index) => (
            <div
              key={cell.title}
              style={{
                borderRight: index % 2 === 0 ? "1px solid #334155" : undefined,
                borderBottom: index < 2 ? "1px solid #334155" : undefined,
              }}
            >
              <GridCell
                title={cell.title}
                stat={cell.format(liveData[index] ?? cell.seed)}
                data={liveData[index] ?? cell.seed}
                tone={cell.tone}
              />
            </div>
          ))}
        </div>

        <div style={{ padding: "10px 12px" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Combined p95 latency
          </div>
          <ChartContainer
            theme={industrialTheme}
            mode="live"
            height={80}
            width="100%"
            debounceMs={16}
          >
            <LineChart
              categories={DAYS}
              series={[{ name: "p95 latency", data: latency }]}
              fill
              valueSuffix=" ms"
            />
          </ChartContainer>
          <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
            Source: metrics · each tile: 7-day mini line with grid + fill
          </p>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Mockups/L · Grid Cells",
  component: GridCellsMockup,
  parameters: {
    docs: {
      description: {
        component:
          "Round 2 acceptance target — 320px 4-up grid, mini charts with grid + fill, combined footer chart.",
      },
    },
  },
} satisfies Meta<typeof GridCellsMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LiveGridWall: Story = {
  render: () => <GridCellsMockup />,
};
