import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DashboardEmbed } from "@axicharts/charts-runtime";

const CATEGORIES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function mutateOpsGrid(data: Record<string, unknown>): Record<string, unknown> {
  const cells = (data.cells as Array<{ title: string; data: number[]; suffix?: string; tone?: string }>) ?? [];
  return {
    categories: data.categories,
    cells: cells.map((cell) => {
      const next = [...cell.data];
      const last = next[next.length - 1] ?? 0;
      const delta = (Math.random() - 0.5) * 6;
      next.push(Math.max(0, last + delta));
      if (next.length > 7) next.shift();
      return { ...cell, data: next };
    }),
  };
}

const meta = {
  title: "Runtime/Embed",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C4 `@axicharts/charts-runtime` — bind REST/WebSocket/mock-live data sources to charts-spec dashboard templates.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpsWallMockLive: Story = {
  render: (): ReactElement => (
    <DashboardEmbed
      dashboard={{
        version: "0.1",
        title: "prod-api-01",
        subtitle: "Live · mock MQTT",
        theme: "industrial",
        mode: "live",
        template: "ops-2x2",
        staleAfterMs: 5000,
        dataSource: {
          type: "mock-live",
          intervalMs: 1000,
          data: {
            categories: CATEGORIES,
            cells: [
              { title: "CPU", data: [22, 28, 31, 34, 30, 34, 32], suffix: "%" },
              { title: "Memory", data: [55, 58, 60, 59, 61, 62, 61], suffix: "%" },
              {
                title: "Errors",
                data: [1, 2, 5, 3, 2, 4, 3],
                suffix: "/min",
                tone: "warning",
              },
              { title: "p95", data: [42, 38, 55, 49, 62, 58, 71], suffix: "ms" },
            ],
          },
          mutate: mutateOpsGrid,
        },
      }}
    />
  ),
};

export const FinanceStatic: Story = {
  render: (): ReactElement => (
    <DashboardEmbed
      dashboard={{
        template: "finance-pnl",
        title: "Q2 P&L bridge",
        subtitle: "USD · FY26",
        theme: "clean",
        data: {
          kpis: [
            { value: "$1.33M", label: "Net revenue" },
            { value: "62.4%", label: "Gross margin", tone: "success" },
            { value: "+18%", label: "QoQ growth" },
          ],
          waterfall: [
            { name: "Q1", value: 1100000, isTotal: true },
            { name: "New ARR", value: 240000 },
            { name: "Churn", value: -80000, tone: "critical" },
            { name: "Q2", value: 1330000, isTotal: true },
          ],
          categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          revenue: [820, 932, 901, 1034, 1290, 1330],
        },
      }}
    />
  ),
};
