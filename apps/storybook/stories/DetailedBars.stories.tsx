import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BarChart, ChartContainer, Stat } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const WEEKS = ["W1", "W2", "W3", "W4", "W5"];
const THROUGHPUT = [120, 90, 150, 110, 180];
const TARGET = 150;

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

function DetailedBarsMockup(): ReactElement {
  const peak = Math.max(...THROUGHPUT);
  const average = THROUGHPUT.reduce((sum, value) => sum + value, 0) / THROUGHPUT.length;
  const latest = THROUGHPUT[THROUGHPUT.length - 1] ?? 0;
  const previous = THROUGHPUT[THROUGHPUT.length - 2] ?? latest;
  const vsPrevious = previous === 0 ? 0 : ((latest - previous) / previous) * 100;
  const vsTarget = ((latest - TARGET) / TARGET) * 100;
  const weeksAboveTarget = THROUGHPUT.filter((value) => value >= TARGET).length;

  return (
    <div
      style={{
        maxWidth: 520,
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
          padding: "12px 16px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
          API gateway throughput
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
          Last 5 weeks
        </span>
      </div>

      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <KpiTile>
            <div style={{ fontSize: 24, lineHeight: 1.1, fontWeight: 600, color: "#0f172a" }}>
              {peak}
              <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>
                {" "}
                req/min
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              Peak · W5
            </div>
          </KpiTile>
          <KpiTile>
            <Stat
              value={`${vsPrevious >= 0 ? "+" : ""}${vsPrevious.toFixed(0)}%`}
              label="vs W4"
              tone={vsPrevious >= 0 ? "success" : "warning"}
              surface="light"
            />
          </KpiTile>
          <KpiTile>
            <Stat
              value={`${weeksAboveTarget}/5`}
              label="weeks ≥ target"
              tone={weeksAboveTarget >= 3 ? "success" : "warning"}
              surface="light"
            />
          </KpiTile>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600 }}>Weekly throughput</div>
          <span
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 999,
              background: vsTarget >= 0 ? "#ecfdf5" : "#fff7ed",
              color: vsTarget >= 0 ? "#15803d" : "#c2410c",
            }}
          >
            W5 {vsTarget >= 0 ? "+" : ""}
            {vsTarget.toFixed(0)}% vs target
          </span>
        </div>

        <ChartContainer theme={cleanTheme} height={220} width="100%">
          <BarChart
            categories={WEEKS}
            series={[{ name: "Throughput", data: THROUGHPUT }]}
            showValues
            valueSuffix=" req/min"
            referenceLines={[{ value: TARGET, label: "Target 150", tone: "warning" }]}
            thresholdBands={[
              { min: 0, max: TARGET, label: "Below target", tone: "warning" },
            ]}
          />
        </ChartContainer>
        <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
          Source: gateway · W1–W5 · avg {average.toFixed(0)} req/min · Y: req/min, X:
          week · value labels, target line, below-target band
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: "Mockups/I · Detailed Bars",
  component: DetailedBarsMockup,
  parameters: {
    docs: {
      description: {
        component:
          "Round 3 acceptance target (5/5) — KPI tiles, target attainment chip, threshold band below target, reference line, showValues bar chart.",
      },
    },
  },
} satisfies Meta<typeof DetailedBarsMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WeeklyThroughput: Story = {
  render: () => <DetailedBarsMockup />,
};
