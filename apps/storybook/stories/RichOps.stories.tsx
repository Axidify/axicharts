import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  LineChart,
  Stat,
  type PlotSeries,
} from "@axicharts/charts";
import { industrialTheme } from "@axicharts/charts-theme";
import { DAYS, useLiveSeries } from "./utils/liveSeries";

function Panel({
  label,
  value,
  data,
  tone,
}: {
  label: string;
  value: string;
  data: number[];
  tone?: PlotSeries["tone"];
}): ReactElement {
  return (
    <div
      style={{
        border: "1px solid #334155",
        borderRadius: 6,
        padding: "8px 10px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
        <span
          style={{
            fontSize: 12,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          {value}
        </span>
      </div>
      <ChartContainer
        theme={industrialTheme}
        mode="live"
        height={56}
        width="100%"
        debounceMs={16}
      >
        <LineChart
          categories={DAYS}
          series={[{ name: label, data, tone }]}
          fill
          showAxes={false}
        />
      </ChartContainer>
    </div>
  );
}

function RichOpsMockup(): ReactElement {
  const cpu = useLiveSeries([22, 28, 31, 34, 30, 34, 32], 5);
  const memory = useLiveSeries([55, 58, 60, 59, 61, 62, 61], 5);
  const errors = useLiveSeries([1, 2, 5, 3, 2, 4, 3], 5);
  const latency = useLiveSeries([42, 38, 55, 49, 62, 58, 71], 5);

  return (
    <div style={{ maxWidth: 720 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <strong style={{ fontSize: 13 }}>prod-api-01</strong>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 11,
            padding: "2px 8px",
            borderRadius: 999,
            background: "#14532d",
            color: "#86efac",
          }}
        >
          Live
        </span>
        <span
          style={{
            fontSize: 12,
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
          gap: 6,
          marginBottom: 12,
        }}
      >
        <Panel label="CPU" value={`${cpu[cpu.length - 1]?.toFixed(0)}%`} data={cpu} />
        <Panel
          label="Memory"
          value={`${memory[memory.length - 1]?.toFixed(0)}%`}
          data={memory}
        />
        <Panel
          label="Errors"
          value={`${errors[errors.length - 1]?.toFixed(0)}/min`}
          data={errors}
          tone="warning"
        />
        <Panel
          label="p95"
          value={`${latency[latency.length - 1]?.toFixed(0)}ms`}
          data={latency}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <Stat
            value={`${latency[latency.length - 1]?.toFixed(0)} ms`}
            label="p95 peak"
            monospace
          />
          <Stat
            value={`${errors[errors.length - 1]?.toFixed(0)}/min`}
            label="error peak"
            tone="warning"
            monospace
          />
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
          Error rate (5m)
        </div>
        <ChartContainer
          theme={industrialTheme}
          mode="live"
          height={100}
          width="100%"
          debounceMs={16}
        >
          <LineChart
            categories={DAYS}
            series={[
              { name: "errors/min", data: errors, tone: "warning" },
            ]}
            fill
            valueSuffix="/min"
          />
        </ChartContainer>
        <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
          Source: Prometheus · 5m scrape · Y: errors/min, X: day · grid on all
          panels
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: "Mockups/H · Rich Ops",
  component: RichOpsMockup,
  parameters: {
    docs: {
      description: {
        component:
          "Round 2 acceptance target — 2×2 ops grid with grid-lined mini charts, monospace live values, semantic warn tone.",
      },
    },
  },
} satisfies Meta<typeof RichOpsMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LiveOpsPanel: Story = {
  render: () => <RichOpsMockup />,
};
