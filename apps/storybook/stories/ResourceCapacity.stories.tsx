import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  BarChart,
  ChartContainer,
  Gauge,
  PieChart,
  Stat,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const VCPU_HOURS = [420, 510, 480, 620, 580];
const VCPU_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const VCPU_TARGET = 550;
const CPU_POOL = 78;
const MEMORY_POOL = 64;

function KpiTile({ children }: { children: ReactElement }): ReactElement {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "10px 12px",
      }}
    >
      {children}
    </div>
  );
}

function ResourceCapacityMockup(): ReactElement {
  const peakHours = Math.max(...VCPU_HOURS);
  const latestHours = VCPU_HOURS[VCPU_HOURS.length - 1] ?? 0;
  const vsTarget = ((latestHours - VCPU_TARGET) / VCPU_TARGET) * 100;
  const cpuWarn = CPU_POOL >= 70;

  return (
    <div
      style={{
        maxWidth: 720,
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        background: "#ffffff",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "12px 16px",
          borderBottom: "1px solid #e2e8f0",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
          Cloud capacity · us-east-1
        </span>
        <span
          style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 999,
            background: "#eff6ff",
            color: "#1d4ed8",
          }}
        >
          Resource management
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#64748b",
            background: "#f1f5f9",
            borderRadius: 999,
            padding: "3px 8px",
          }}
        >
          This week
        </span>
      </div>

      <div style={{ padding: 16 }}>
        {cpuWarn ? (
          <div
            style={{
              marginBottom: 12,
              fontSize: 11,
              color: "#9a3412",
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: 8,
              padding: "8px 10px",
            }}
          >
            Compute pool at {CPU_POOL}% — above 70% warn threshold · 12 jobs queued
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <KpiTile>
            <Stat
              value={`${CPU_POOL}%`}
              label="CPU pool"
              tone="warning"
              surface="light"
              stale={cpuWarn}
            />
          </KpiTile>
          <KpiTile>
            <Stat value={`${MEMORY_POOL}%`} label="Memory" tone="success" surface="light" />
          </KpiTile>
          <KpiTile>
            <Stat value="12" label="Pending jobs" tone="warning" surface="light" />
            <div style={{ marginTop: 6, fontSize: 10, color: "#b45309" }}>Queue pressure</div>
          </KpiTile>
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
          Utilization gauges
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
        >
          <Gauge value={CPU_POOL} label="Compute" unit="%" warningAt={70} criticalAt={90} />
          <Gauge value={MEMORY_POOL} label="Storage" unit="%" warningAt={75} criticalAt={92} />
          <Gauge value={41} label="Network" unit="%" warningAt={80} criticalAt={95} />
        </div>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600 }}>Allocation mix</span>
              <span style={{ fontSize: 10, color: "#b45309" }}>12% idle</span>
            </div>
            <ChartContainer theme={cleanTheme} height={220} width="100%">
              <PieChart
                showLabels
                slices={[
                  { name: "Production", value: 48, tone: "info" },
                  { name: "Staging", value: 22, tone: "default" },
                  { name: "Analytics", value: 18, tone: "success" },
                  { name: "Idle", value: 12, tone: "warning" },
                ]}
              />
            </ChartContainer>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600 }}>vCPU hours</span>
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: vsTarget >= 0 ? "#fff7ed" : "#ecfdf5",
                  color: vsTarget >= 0 ? "#c2410c" : "#15803d",
                }}
              >
                Fri {vsTarget >= 0 ? "+" : ""}
                {vsTarget.toFixed(0)}% vs cap
              </span>
            </div>
            <ChartContainer theme={cleanTheme} height={220} width="100%">
              <BarChart
                categories={VCPU_DAYS}
                series={[{ name: "vCPU hours", data: VCPU_HOURS }]}
                showValues
                valueSuffix=" h"
                referenceLines={[
                  { value: VCPU_TARGET, label: "Weekly cap", tone: "warning" },
                ]}
                thresholdBands={[
                  { min: VCPU_TARGET, max: peakHours + 40, label: "Over cap", tone: "warning" },
                ]}
              />
            </ChartContainer>
          </div>
        </div>

        <p style={{ marginTop: 10, fontSize: 11, color: "#64748b" }}>
          Gauges with warn/crit thresholds · allocation pie · weekly bar usage with
          cap reference and over-cap band
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: "Mockups/O · Resource Capacity",
  component: ResourceCapacityMockup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Round 3 acceptance target (5/5) — KPI tiles, compute warn callout, utilization gauges, allocation idle chip, weekly vCPU bars with cap reference and over-cap band.",
      },
    },
  },
} satisfies Meta<typeof ResourceCapacityMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CapacityWall: Story = {
  render: () => <ResourceCapacityMockup />,
};
