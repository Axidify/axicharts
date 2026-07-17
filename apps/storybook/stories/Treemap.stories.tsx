import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, TreemapChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const CLOUD_COSTS = [
  {
    name: "Compute",
    children: [
      { name: "EC2", value: 42_000, tone: "info" as const },
      { name: "Lambda", value: 12_500, tone: "default" as const },
      { name: "EKS", value: 18_200, tone: "success" as const },
    ],
  },
  {
    name: "Storage",
    children: [
      { name: "S3", value: 9_800, tone: "warning" as const },
      { name: "EBS", value: 6_400 },
    ],
  },
  {
    name: "Data",
    children: [
      { name: "RDS", value: 15_600 },
      { name: "Redshift", value: 11_300, tone: "critical" as const },
    ],
  },
];

function CloudCostTreemap(): ReactElement {
  return (
    <div style={{ maxWidth: 560 }}>
      <ChartContainer theme={cleanTheme} height={320} width="100%">
        <TreemapChart nodes={CLOUD_COSTS} />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Hierarchical cost allocation — hover tiles for value and share
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Treemap",
  component: CloudCostTreemap,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C2 TreemapChart — nested hierarchy via ECharts with React tooltip overlay.",
      },
    },
  },
} satisfies Meta<typeof CloudCostTreemap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CloudCosts: Story = {
  render: () => <CloudCostTreemap />,
};
