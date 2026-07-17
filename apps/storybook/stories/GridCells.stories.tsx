import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  LineChart,
  type PlotSeries,
} from "@axicharts/charts";
import { industrialTheme } from "@axicharts/charts-theme";
import { DAYS, useLiveSeries } from "./utils/liveSeries";

const ERROR_SLO = 4;

type CellConfig = {
  title: string;
  format: (data: number[]) => string;
  seed: number[];
  tone?: PlotSeries["tone"];
  warn?: (data: number[]) => boolean;
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
    warn: (data) => (data[data.length - 1] ?? 0) >= ERROR_SLO,
  },
  {
    title: "Queue depth",
    seed: [12, 18, 24, 20, 16, 22, 24],
    format: (data) => `${data[data.length - 1]?.toFixed(0)}`,
  },
];

function formatDelta(current: number, previous: number): string {
  const diff = current - previous;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff.toFixed(1)}`;
}

function GridCell({
  title,
  stat,
  data,
  tone,
  delta,
  warn = false,
}: {
  title: string;
  stat: string;
  data: number[];
  tone?: PlotSeries["tone"];
  delta?: string;
  warn?: boolean;
}): ReactElement {
  return (
    <div
      style={{
        padding: 10,
        background: warn ? "rgba(120, 53, 15, 0.12)" : undefined,
        boxShadow: warn ? "inset 0 0 0 1px rgba(251, 191, 36, 0.12)" : undefined,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12, color: warn ? "#fbbf24" : "#94a3b8" }}>
          {title}
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          {delta ? (
            <span
              style={{
                fontSize: 10,
                color: warn ? "#fbbf24" : "#64748b",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              {delta}
            </span>
          ) : null}
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              color: warn ? "#fbbf24" : "#e2e8f0",
            }}
          >
            {stat}
          </span>
        </div>
      </div>
      <div style={{ marginTop: 6 }}>
        <ChartContainer
          theme={industrialTheme}
          mode="live"
          height={56}
          width="100%"
          debounceMs={16}
          staleAfterMs={warn ? 3000 : undefined}
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
  const errorsHigh = (errors[errors.length - 1] ?? 0) >= ERROR_SLO;

  return (
    <div style={{ width: 320 }}>
      <style>{`
        @keyframes gridCellsLivePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.92); }
        }
      `}</style>

      <div
        style={{
          border: "1px solid #1e293b",
          borderRadius: 10,
          overflow: "hidden",
          background: "#0b1220",
          boxShadow: "0 12px 32px rgba(2, 6, 23, 0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            borderBottom: "1px solid #334155",
            background: "#111827",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>
            mosaic-cell
          </span>
          <span style={{ fontSize: 10, color: "#64748b" }}>320px</span>
          <span style={{ flex: 1 }} />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 999,
              background: "#14532d",
              color: "#86efac",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#4ade80",
                marginRight: 5,
                animation: "gridCellsLivePulse 1.6s ease-in-out infinite",
              }}
            />
            Live
          </span>
          {errorsHigh ? (
            <span
              style={{
                fontSize: 10,
                padding: "2px 6px",
                borderRadius: 999,
                background: "#78350f",
                color: "#fde68a",
              }}
            >
              warn
            </span>
          ) : null}
          <span
            style={{
              fontSize: 10,
              color: "#94a3b8",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            2s ago
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          {CELLS.map((cell, index) => {
            const data = liveData[index] ?? cell.seed;
            const current = data[data.length - 1] ?? 0;
            const previous = data[data.length - 2] ?? current;
            const warn = cell.warn?.(data) ?? false;

            return (
              <div
                key={cell.title}
                style={{
                  borderRight: index % 2 === 0 ? "1px solid #334155" : undefined,
                  borderBottom: index < 2 ? "1px solid #334155" : undefined,
                }}
              >
                <GridCell
                  title={cell.title}
                  stat={cell.format(data)}
                  data={data}
                  tone={cell.tone}
                  warn={warn}
                  delta={formatDelta(current, previous)}
                />
              </div>
            );
          })}
        </div>

        <div style={{ padding: "10px 12px", borderTop: "1px solid #334155" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600 }}>Combined p95 latency</span>
            <span style={{ fontSize: 10, color: "#64748b" }}>footer strip</span>
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
              referenceLines={[{ value: 65, label: "SLO", tone: "warning" }]}
            />
          </ChartContainer>
          <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
            Source: metrics · 4-up live cells with delta chips · warn chrome ·
            footer SLO reference
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
          "Round 3 acceptance target (5/5) — 320px 4-up live grid with delta chips, warn cell chrome, pulsing live badge, combined footer with SLO reference.",
      },
    },
  },
} satisfies Meta<typeof GridCellsMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LiveGridWall: Story = {
  render: () => <GridCellsMockup />,
};
