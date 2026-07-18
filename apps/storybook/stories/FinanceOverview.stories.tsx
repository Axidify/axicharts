import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AreaChart,
  ChartContainer,
  LineChart,
  Stat,
  WaterfallChart,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const REVENUE = [820, 932, 901, 1034, 1290, 1330];
const REVENUE_TARGET = 1280;

function KpiTile({ children }: { children: ReactElement }): ReactElement {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "10px 12px",
        display: "grid",
        gap: 6,
      }}
    >
      {children}
    </div>
  );
}

function RevenueSparkline(): ReactElement {
  return (
    <ChartContainer theme={cleanTheme} height={32} width="100%">
      <LineChart
        categories={MONTHS}
        series={[{ name: "Revenue", data: REVENUE, tone: "success" }]}
        fill
        showAxes={false}
      />
    </ChartContainer>
  );
}

function FinanceOverviewMockup(): ReactElement {
  const latestRevenue = REVENUE[REVENUE.length - 1] ?? 0;
  const previousRevenue = REVENUE[REVENUE.length - 2] ?? latestRevenue;
  const momGrowth =
    previousRevenue === 0
      ? 0
      : ((latestRevenue - previousRevenue) / previousRevenue) * 100;
  const vsTarget = ((latestRevenue - REVENUE_TARGET) / REVENUE_TARGET) * 100;

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
          Q2 P&amp;L bridge
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
          FP&amp;A · closed books
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
          USD · FY26 · as of Jun
        </span>
      </div>

      <div style={{ padding: 16 }}>
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
          Churn drag — $80k headwind in Q2 bridge (largest negative driver)
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <KpiTile>
            <Stat value="$1.33M" label="Net revenue" surface="light" />
            <RevenueSparkline />
          </KpiTile>
          <KpiTile>
            <Stat value="62.4%" label="Gross margin" tone="success" surface="light" />
            <div style={{ fontSize: 10, color: "#15803d" }}>+1.2 pts vs Q1</div>
          </KpiTile>
          <KpiTile>
            <Stat value="+18%" label="QoQ growth" tone="info" surface="light" />
            <div style={{ fontSize: 10, color: "#64748b" }}>
              Jun {momGrowth >= 0 ? "+" : ""}
              {momGrowth.toFixed(1)}% MoM
            </div>
          </KpiTile>
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
          Revenue bridge
        </div>
        <ChartContainer theme={cleanTheme} height={220} width="100%">
          <WaterfallChart
            valueFormat="currency"
            items={[
              { name: "Q1", value: 1100000, isTotal: true },
              { name: "New ARR", value: 240000 },
              { name: "Expansion", value: 120000 },
              { name: "Churn", value: -80000, tone: "critical" },
              { name: "Services", value: 50000 },
              { name: "Q2", value: 1330000, isTotal: true },
            ]}
          />
        </ChartContainer>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "16px 0 6px",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600 }}>Monthly revenue trend</div>
          <span
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 999,
              background: vsTarget >= 0 ? "#ecfdf5" : "#fff7ed",
              color: vsTarget >= 0 ? "#15803d" : "#c2410c",
            }}
          >
            Jun {vsTarget >= 0 ? "+" : ""}
            {vsTarget.toFixed(1)}% vs plan
          </span>
        </div>
        <ChartContainer theme={cleanTheme} height={160} width="100%">
          <AreaChart
            categories={MONTHS}
            series={[{ name: "Revenue", data: REVENUE }]}
            referenceLines={[
              { value: REVENUE_TARGET, label: "Plan", tone: "warning" },
            ]}
          />
        </ChartContainer>
        <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
          USD thousands · waterfall bridge + KPI sparklines · plan reference on
          monthly area trend
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: "Mockups/M · Finance Overview",
  component: FinanceOverviewMockup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Round 3 acceptance target (5/5) — FP&A KPI tiles with revenue sparkline, churn callout, P&L waterfall bridge, monthly area with plan reference line.",
      },
    },
  },
} satisfies Meta<typeof FinanceOverviewMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PnlBridge: Story = {
  render: () => <FinanceOverviewMockup />,
};
