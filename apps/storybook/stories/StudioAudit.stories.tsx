import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  Line,
  LineChart as RechartsLineChart,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from "recharts";
import { ChartContainer, BarChart, LineChart } from "@axicharts/charts";
import { QuickLineChart } from "@axicharts/charts/quick";
import { StudioBarChart, StudioLineChart } from "@axicharts/charts/studio";
import { cleanTheme } from "@axicharts/charts-theme";
import { TILE_H, TILE_W } from "../demo/RechartsParityCompare";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const LATENCY = [42, 38, 55, 49, 62];
const THROUGHPUT = [120, 90, 150, 110, 180];
const ROWS = DAYS.map((day, index) => ({
  day,
  p95: LATENCY[index]!,
  throughput: THROUGHPUT[index]!,
}));

const LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  marginBottom: 8,
};

const PANEL: React.CSSProperties = {
  width: TILE_W,
  height: TILE_H,
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  background: "#ffffff",
  overflow: "hidden",
};

function StudioAuditRow({
  title,
  left,
  center,
  right,
}: {
  title: string;
  left: ReactElement;
  center: ReactElement;
  right: ReactElement;
}): ReactElement {
  return (
    <section style={{ paddingBottom: 24, borderBottom: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#0f172a" }}>
        {title}
        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>
          D-310 · {TILE_W}×{TILE_H}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(3, ${TILE_W}px)`, gap: 16 }}>
        <div>
          <div style={{ ...LABEL, color: "#94a3b8" }}>Recharts · bare</div>
          <div style={PANEL}>{left}</div>
        </div>
        <div>
          <div style={{ ...LABEL, color: "#64748b" }}>cleanTheme</div>
          <div style={PANEL}>{center}</div>
        </div>
        <div data-theme="studio">
          <div style={{ ...LABEL, color: "#2563eb" }}>studioTheme</div>
          <div style={PANEL}>{right}</div>
        </div>
      </div>
    </section>
  );
}

function StudioAuditWall(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <div>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, color: "#0f172a" }}>
          Studio lane — editorial polish audit
        </h2>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#64748b" }}>
          Separate from Recharts parity — gradient areas, soft grid, bar highlight @ dashboard tile
          density. Reference: Bklit-style editorial dashboards (not pixel-matched).
        </p>
      </div>
      <StudioAuditRow
        title="Line — API p95"
        left={
          <RechartsLineChart width={TILE_W} height={TILE_H} data={ROWS} margin={{ left: 4, right: 8 }}>
            <RechartsXAxis dataKey="day" tick={{ fontSize: 10 }} />
            <RechartsYAxis tick={{ fontSize: 10 }} width={28} />
            <Line type="monotone" dataKey="p95" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
          </RechartsLineChart>
        }
        center={
          <ChartContainer theme={cleanTheme} mode="static" height={TILE_H} width={TILE_W}>
            <LineChart categories={DAYS} series={[{ name: "p95", data: LATENCY }]} fill />
          </ChartContainer>
        }
        right={<StudioLineChart labels={DAYS} data={LATENCY} name="p95" height={TILE_H} />}
      />
      <StudioAuditRow
        title="Bar — throughput"
        left={
          <RechartsBarChart width={TILE_W} height={TILE_H} data={ROWS} margin={{ left: 4, right: 8 }}>
            <RechartsXAxis dataKey="day" tick={{ fontSize: 10 }} />
            <RechartsYAxis tick={{ fontSize: 10 }} width={28} />
            <Bar dataKey="throughput" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </RechartsBarChart>
        }
        center={
          <ChartContainer theme={cleanTheme} mode="static" height={TILE_H} width={TILE_W}>
            <BarChart categories={DAYS} series={[{ name: "throughput", data: THROUGHPUT }]} />
          </ChartContainer>
        }
        right={<StudioBarChart labels={DAYS} data={THROUGHPUT} name="throughput" height={TILE_H} />}
      />
      <StudioAuditRow
        title="Area — gradient fill"
        left={
          <RechartsAreaChart width={TILE_W} height={TILE_H} data={ROWS} margin={{ left: 4, right: 8 }}>
            <RechartsXAxis dataKey="day" tick={{ fontSize: 10 }} />
            <RechartsYAxis tick={{ fontSize: 10 }} width={28} />
            <Area type="monotone" dataKey="p95" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
          </RechartsAreaChart>
        }
        center={
          <QuickLineChart labels={DAYS} data={LATENCY} height={TILE_H} fill theme={cleanTheme} />
        }
        right={<StudioLineChart labels={DAYS} data={LATENCY} height={TILE_H} fill />}
      />
    </div>
  );
}

const meta = {
  title: "Audit/Studio",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Studio lane audit (D-310) — Bklit/Recharts-styled reference vs clean vs studio @ 360×280.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const StudioTileWall: Story = {
  render: () => <StudioAuditWall />,
};
