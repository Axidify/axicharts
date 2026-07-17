import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DashboardEmbed } from "@axicharts/charts-runtime";

const TIMESTAMPS = ["08:00", "09:00", "10:00", "11:00", "12:00"];

const meta = {
  title: "Runtime/Historian",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C4 historian adapter — rolling REST window with tag-series mapping for ops walls.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpsHistorianMock: Story = {
  render: (): ReactElement => (
    <DashboardEmbed
      dashboard={{
        title: "Historian tags",
        subtitle: "Rolling 1h window · 2s poll",
        theme: "industrial",
        mode: "live",
        template: "ops-2x2",
        staleAfterMs: 5000,
        dataSource: {
          type: "historian",
          url: "https://historian.example/tags",
          tags: ["cpu", "memory", "errors", "p95"],
          windowMs: 3_600_000,
          intervalMs: 2000,
          fetch: async () => ({
            ok: true,
            json: async () => ({
              tags: [
                {
                  name: "CPU",
                  timestamps: TIMESTAMPS,
                  values: [22, 28, 31, 34, 30],
                  suffix: "%",
                },
                {
                  name: "Memory",
                  timestamps: TIMESTAMPS,
                  values: [55, 58, 60, 59, 61],
                  suffix: "%",
                },
                {
                  name: "Errors",
                  timestamps: TIMESTAMPS,
                  values: [1, 2, 5, 3, 2],
                  suffix: "/min",
                  tone: "warning",
                },
                {
                  name: "p95",
                  timestamps: TIMESTAMPS,
                  values: [42, 38, 55, 49, 62],
                  suffix: "ms",
                },
              ],
            }),
          }),
        },
      }}
    />
  ),
};
