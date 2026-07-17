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

const ERROR_SLO = 4;

function formatDelta(current: number, previous: number, suffix = ""): string {
  const diff = current - previous;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff.toFixed(1)}${suffix}`;
}

function Panel({
  label,
  value,
  data,
  tone,
  delta,
  warn = false,
}: {
  label: string;
  value: string;
  data: number[];
  tone?: PlotSeries["tone"];
  delta?: string;
  warn?: boolean;
}): ReactElement {
  return (
    <div
      style={{
        border: warn ? "1px solid #b45309" : "1px solid #334155",
        borderRadius: 8,
        padding: "8px 10px",
        background: warn ? "rgba(120, 53, 15, 0.12)" : "#0f172a",
        boxShadow: warn ? "inset 0 0 0 1px rgba(251, 191, 36, 0.12)" : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
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
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              color: warn ? "#fbbf24" : "#e2e8f0",
            }}
          >
            {value}
          </span>
        </div>
      </div>
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

  const cpuNow = cpu[cpu.length - 1] ?? 0;
  const memoryNow = memory[memory.length - 1] ?? 0;
  const errorsNow = errors[errors.length - 1] ?? 0;
  const latencyNow = latency[latency.length - 1] ?? 0;
  const errorsPrev = errors[errors.length - 2] ?? errorsNow;
  const errorsHigh = errorsNow >= ERROR_SLO;

  return (
    <div style={{ maxWidth: 720 }}>
      <style>{`
        @keyframes richOpsLivePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.92); }
        }
      `}</style>

      <div
        style={{
          border: "1px solid #1e293b",
          borderRadius: 10,
          background: "#0b1220",
          boxShadow: "0 12px 32px rgba(2, 6, 23, 0.45)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <strong style={{ fontSize: 13 }}>prod-api-01</strong>
          <span
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 999,
              background: "#1e293b",
              color: "#94a3b8",
            }}
          >
            us-east-1
          </span>
          <span style={{ flex: 1 }} />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: 11,
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
                animation: "richOpsLivePulse 1.6s ease-in-out infinite",
              }}
            />
            Live
          </span>
          {errorsHigh ? (
            <span
              style={{
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 999,
                background: "#78350f",
                color: "#fde68a",
              }}
            >
              1 warn
            </span>
          ) : null}
          <span
            style={{
              fontSize: 11,
              color: "#94a3b8",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              background: "#111827",
              borderRadius: 999,
              padding: "3px 8px",
            }}
          >
            2s ago
          </span>
        </div>

        <div style={{ padding: 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Panel
              label="CPU"
              value={`${cpuNow.toFixed(0)}%`}
              data={cpu}
              delta={formatDelta(cpuNow, cpu[cpu.length - 2] ?? cpuNow, "%")}
            />
            <Panel
              label="Memory"
              value={`${memoryNow.toFixed(0)}%`}
              data={memory}
              delta={formatDelta(memoryNow, memory[memory.length - 2] ?? memoryNow, "%")}
            />
            <Panel
              label="Errors"
              value={`${errorsNow.toFixed(0)}/min`}
              data={errors}
              tone="warning"
              warn={errorsHigh}
              delta={formatDelta(errorsNow, errorsPrev, "/min")}
            />
            <Panel
              label="p95"
              value={`${latencyNow.toFixed(0)}ms`}
              data={latency}
              delta={formatDelta(latencyNow, latency[latency.length - 2] ?? latencyNow, "ms")}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <Stat
                value={`${latencyNow.toFixed(0)} ms`}
                label="p95 peak"
                monospace
              />
              <Stat
                value={`${errorsNow.toFixed(0)}/min`}
                label="error peak"
                tone="warning"
                monospace
                stale={errorsHigh}
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
                series={[{ name: "errors/min", data: errors, tone: "warning" }]}
                fill
                valueSuffix="/min"
                referenceLines={[
                  { value: ERROR_SLO, label: "SLO 4/min", tone: "warning" },
                ]}
              />
            </ChartContainer>
            <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
              Source: Prometheus · 5m scrape · Y: errors/min, X: day · SLO reference
              line · warn panel chrome when above threshold
            </p>
          </div>
        </div>
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
          "Round 3 acceptance target (5/5) — live 2×2 ops grid with delta chips, warn panel chrome, pulsing live badge, SLO reference line, stale/error stat treatment.",
      },
    },
  },
} satisfies Meta<typeof RichOpsMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LiveOpsPanel: Story = {
  render: () => <RichOpsMockup />,
};
