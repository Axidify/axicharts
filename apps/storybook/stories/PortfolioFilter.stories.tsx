import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, LineChart, type ChartCategoryInput } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

type DayMeta = { date: string };

const DAYS: ChartCategoryInput<DayMeta>[] = [
  { label: "Mon", meta: { date: "2026-07-13" } },
  { label: "Tue", meta: { date: "2026-07-14" } },
  { label: "Wed", meta: { date: "2026-07-15" } },
  { label: "Thu", meta: { date: "2026-07-16" } },
  { label: "Fri", meta: { date: "2026-07-17" } },
];

const DELIVERED = [12, 8, 15, 10, 14];
const INSTALLED = [10, 7, 12, 9, 11];

function PortfolioFilterDemo(): ReactElement {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex != null ? DAYS[selectedIndex] : null;

  return (
    <div style={{ width: 640, padding: 24, fontFamily: "system-ui,sans-serif" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { label: "Open", value: "24" },
          { label: "In progress", value: "8" },
          { label: "Done", value: "41" },
        ].map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            style={{
              flex: "1 1 120px",
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              textAlign: "left",
              cursor: "default",
            }}
          >
            <div style={{ fontSize: 11, color: "#64748b" }}>{kpi.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{kpi.value}</div>
          </button>
        ))}
      </div>

      <p style={{ fontSize: 13, color: "#475569", margin: "0 0 8px" }}>
        Click a day on the chart to filter (replaces separate day-chip row).
      </p>

      <ChartContainer theme={cleanTheme} minHeight={260}>
        <LineChart
          categories={DAYS}
          series={[
            { name: "Delivered", data: DELIVERED },
            { name: "Installed", data: INSTALLED },
          ]}
          fill
          selectedCategoryIndex={selectedIndex ?? undefined}
          onCategoryClick={(e) => setSelectedIndex(e.categoryIndex)}
        />
      </ChartContainer>

      <div
        style={{
          marginTop: 12,
          padding: "10px 12px",
          borderRadius: 8,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          fontSize: 13,
        }}
      >
        {selected ? (
          <>
            Filter active: <strong>{selected.label}</strong> ({selected.meta?.date})
          </>
        ) : (
          <span style={{ color: "#94a3b8" }}>No day selected — click a category on the chart</span>
        )}
      </div>
    </div>
  );
}

const meta = {
  title: "Charts/Portfolio filter",
  component: PortfolioFilterDemo,
} satisfies Meta<typeof PortfolioFilterDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpsWeekChart: Story = {
  render: () => <PortfolioFilterDemo />,
};

export const FlatZeroWeek: Story = {
  render: () => (
    <div style={{ width: 640, padding: 24 }}>
      <ChartContainer theme={cleanTheme} minHeight={220}>
        <LineChart
          categories={DAYS.map((d) => d.label)}
          series={[{ name: "Throughput", data: [0, 0, 0, 0, 0] }]}
          fill
          onCategoryClick={() => undefined}
        />
      </ChartContainer>
    </div>
  ),
};
