import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Chart } from "@axicharts/charts-spec";
import { planFromIntent } from "@axicharts/charts-planner";

const PROFILE = {
  metrics: [{ name: "throughput", unit: "req/min" }],
  fields: ["week", "throughput", "aboveTarget"],
};

const ROWS = [
  { week: "W1", throughput: 120, aboveTarget: true },
  { week: "W2", throughput: 90, aboveTarget: false },
  { week: "W3", throughput: 150, aboveTarget: true },
  { week: "W4", throughput: 110, aboveTarget: false },
];

function PlannerColorDemo(): ReactElement {
  const plan = planFromIntent(
    PROFILE,
    "Weekly throughput color by above target",
  );
  const panel = plan.panels[0];

  if (!panel) return <div>No panel planned</div>;

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
        Planner inferred encoding.color — no hand-authored spec
      </div>
      <pre
        style={{
          fontSize: 11,
          background: "#f8fafc",
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          overflow: "auto",
        }}
      >
        {JSON.stringify(panel.encoding?.color, null, 2)}
      </pre>
      <Chart panel={panel} data={ROWS} />
    </div>
  );
}

const meta = {
  title: "Spec/PlannerColor",
  component: PlannerColorDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C71 planner rules infer encoding.color from intent phrases and profile field names (aboveTarget, meets_slo, severity, etc.).",
      },
    },
  },
} satisfies Meta<typeof PlannerColorDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InferredColorEncoding: Story = {
  render: () => <PlannerColorDemo />,
};
