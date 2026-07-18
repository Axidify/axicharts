import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Chart } from "@axicharts/charts-spec";

const ROWS = [
  { week: "W1", throughput: 120, aboveTarget: true },
  { week: "W2", throughput: 90, aboveTarget: false },
  { week: "W3", throughput: 150, aboveTarget: true },
  { week: "W4", throughput: 110, aboveTarget: false },
];

function PanelStyleDemo(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 560 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Default clean theme
        </div>
        <Chart
          panel={{
            type: "bar",
            title: "Baseline",
            encoding: {
              x: { field: "week" },
              y: { field: "throughput" },
              color: { field: "aboveTarget" },
            },
            height: 200,
          }}
          data={ROWS}
        />
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          props.style — bold bars, soft grid (no theme fork)
        </div>
        <Chart
          panel={{
            type: "bar",
            title: "AI panel tokens",
            encoding: {
              x: { field: "week" },
              y: { field: "throughput" },
              color: { field: "aboveTarget" },
            },
            props: {
              style: {
                bar: { radius: 10, gap: 0.38 },
                grid: { opacity: 0.35 },
                line: { strokeWidth: 3 },
              },
            },
            height: 200,
          }}
          data={ROWS}
        />
      </div>
    </div>
  );
}

const meta = {
  title: "Spec/PanelStyle",
  component: PanelStyleDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C70 panel-level style tokens — props.style overrides grid, bar, line, and area tokens per panel without forking ChartTheme.",
      },
    },
  },
} satisfies Meta<typeof PanelStyleDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BarPanelTokens: Story = {
  render: () => <PanelStyleDemo />,
};
