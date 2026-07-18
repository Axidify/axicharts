import type { Meta, StoryObj } from "@storybook/react";
import { PresentationDeckRuntime } from "@axicharts/charts-runtime/presentation-deck";

const financeDeckSpec = {
  layout: "embed" as const,
  dashboard: {
    template: "finance-pnl" as const,
    title: "Q4 business review",
    subtitle: "Board deck · FY revenue & margin",
    theme: "presentation" as const,
    mode: "presentation" as const,
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
  },
};

const meta = {
  title: "Runtime/Presentation deck",
  component: PresentationDeckRuntime,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "C89/C116 — fullscreen deck sequencing with enter fade, progress bar, keyboard hints, and KPI count-up choreography. Arrow keys / space advance slides; Escape exits.",
      },
    },
  },
} satisfies Meta<typeof PresentationDeckRuntime>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FinanceBoardDeck: Story = {
  render: () => (
    <PresentationDeckRuntime
      spec={financeDeckSpec}
      title="Q4 business review"
      onExit={() => undefined}
    />
  ),
};

const opsDeckSpec = {
  layout: "embed" as const,
  dashboard: {
    template: "ops-2x2" as const,
    title: "Ops review",
    subtitle: "SRE wall · latency & error budget",
    theme: "presentation" as const,
    mode: "presentation" as const,
    data: {
      cells: [
        { title: "p95 latency", data: [120, 98, 110, 88], suffix: " ms" },
        { title: "Error rate", data: [0.8, 0.6, 0.5, 0.4], suffix: "%" },
        { title: "Throughput", data: [4200, 4600, 5100, 5300] },
        { title: "Saturation", data: [72, 68, 65, 61], suffix: "%" },
      ],
    },
  },
};

export const OpsWallDeck: Story = {
  render: () => (
    <PresentationDeckRuntime
      spec={opsDeckSpec}
      title="Ops review"
      onExit={() => undefined}
    />
  ),
};
