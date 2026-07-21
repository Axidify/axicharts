import type { Meta, StoryObj } from "@storybook/react";
import {
  BarChart,
  ChartContainer,
  ComboChart,
  LineChart,
} from "@axicharts/charts";
import { compilePanel } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";
import {
  ParityAxiTile,
  RechartsParityCompare,
  TILE_H,
  TILE_W,
} from "../demo/RechartsParityCompare";

const PRIORITY_PANEL = {
  specVersion: 1,
  type: "cartesian" as const,
  theme: "clean" as const,
  mode: "static" as const,
  encoding: {
    x: { field: "priority", type: "nominal" as const },
    color: { field: "priority", type: "nominal" as const },
  },
  marks: [{ type: "bar" as const, field: "count", label: "Tickets" }],
};

const PRIORITY_ROWS = [
  { priority: "P1 – Critical", count: 12 },
  { priority: "P2 – High", count: 28 },
  { priority: "P3 – Medium", count: 45 },
  { priority: "P4 – Low", count: 19 },
];

const REVENUE_ROWS = [
  { day: "Mon", revenue: 4200 },
  { day: "Tue", revenue: 3800 },
  { day: "Wed", revenue: 5100 },
  { day: "Thu", revenue: 4600 },
  { day: "Fri", revenue: 5900 },
];

const COMBO_ROWS = [
  { week: "W1", total: 120, avg: 17 },
  { week: "W2", total: 90, avg: 13 },
  { week: "W3", total: 150, avg: 21 },
  { week: "W4", total: 110, avg: 16 },
  { week: "W5", total: 180, avg: 26 },
];

function Tile({ children }: { children: React.ReactElement }) {
  return (
    <div
      style={{
        width: TILE_W,
        height: TILE_H,
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

const meta = {
  title: "Audit/Design",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Recharts design parity at axiboard tile size (360×280). See docs/chart-design-audit.md.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full P0 cartesian wall — visual CI baseline. */
export const RechartsParityTile360: Story = {
  render: () => (
    <RechartsParityCompare
      caseIds={[
        "line-revenue",
        "bar-color",
        "horizontal-priority",
        "stacked-velocity",
        "combo-bar-line",
      ]}
    />
  ),
};

/** Single horizontal bar tile for focused regression. */
export const HorizontalBarTile360: Story = {
  render: () => (
    <Tile>
      <div style={{ width: TILE_W, height: TILE_H }}>
        {compilePanel(
          { ...PRIORITY_PANEL, orientation: "horizontal" },
          PRIORITY_ROWS,
          { height: TILE_H },
        )}
      </div>
    </Tile>
  ),
};

/** Phase 1 distribution tiles — visual CI @ 360×280. */
export const ScatterTile360: Story = {
  render: () => <ParityAxiTile caseId="scatter-risk-return" />,
};

export const RadarTile360: Story = {
  render: () => <ParityAxiTile caseId="radar-scorecard" />,
};

export const HistogramTile360: Story = {
  render: () => <ParityAxiTile caseId="histogram-latency" />,
};

/** Imperative API smoke at tile size. */
export const ImperativeCartesianTile360: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(2, ${TILE_W}px)`, gap: 16 }}>
      <Tile>
        <ChartContainer theme={cleanTheme} height={TILE_H} width={TILE_W}>
          <LineChart
            categories={REVENUE_ROWS.map((row) => row.day)}
            series={[{ name: "Revenue", data: REVENUE_ROWS.map((row) => row.revenue) }]}
          />
        </ChartContainer>
      </Tile>
      <Tile>
        <ChartContainer theme={cleanTheme} height={TILE_H} width={TILE_W}>
          <BarChart
            orientation="horizontal"
            categories={PRIORITY_ROWS.map((row) => row.priority)}
            series={[{ name: "Tickets", data: PRIORITY_ROWS.map((row) => row.count) }]}
          />
        </ChartContainer>
      </Tile>
      <Tile>
        <ChartContainer theme={cleanTheme} height={TILE_H} width={TILE_W}>
          <ComboChart
            categories={COMBO_ROWS.map((row) => row.week)}
            series={[
              { name: "Total", kind: "bar", data: COMBO_ROWS.map((row) => row.total) },
              { name: "Avg", kind: "line", data: COMBO_ROWS.map((row) => row.avg) },
            ]}
          />
        </ChartContainer>
      </Tile>
    </div>
  ),
};
