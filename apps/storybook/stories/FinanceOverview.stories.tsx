import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AreaChart,
  ChartContainer,
  Stat,
  WaterfallChart,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const REVENUE = [820, 932, 901, 1034, 1290, 1330];

function FinanceOverviewMockup(): ReactElement {
  return (
    <div
      style={{
        maxWidth: 720,
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        background: "#ffffff",
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
          Q2 P&amp;L bridge
        </span>
        <span style={{ fontSize: 12, color: "#64748b" }}>USD · FY26</span>
      </div>

      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
          }}
        >
          <Stat value="$1.33M" label="Net revenue" surface="light" />
          <Stat value="62.4%" label="Gross margin" tone="success" surface="light" />
          <Stat value="+18%" label="QoQ growth" tone="info" surface="light" />
        </div>

        <div style={{ marginTop: 16 }}>
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
        </div>

        <div style={{ marginTop: 16 }}>
          <ChartContainer theme={cleanTheme} height={160} width="100%">
            <AreaChart
              categories={MONTHS}
              series={[{ name: "Revenue", data: REVENUE }]}
            />
          </ChartContainer>
          <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
            Monthly revenue trend (USD thousands)
          </p>
        </div>
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
          "Finance vertical — P&L waterfall bridge, KPI strip, area revenue trend.",
      },
    },
  },
} satisfies Meta<typeof FinanceOverviewMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PnlBridge: Story = {
  render: () => <FinanceOverviewMockup />,
};
