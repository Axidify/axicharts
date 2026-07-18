import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Bar,
  BarChart,
  ChartContainer,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "@axicharts/charts";
import { Chart } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";

const WEEKS = ["W1", "W2", "W3", "W4"];
const DATA = WEEKS.map((week, index) => ({
  week,
  revenue: [120, 90, 150, 110][index]!,
  margin: [42, 38, 51, 45][index]!,
}));

function ChromeVariantsDemo(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 720 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Composable — inline legend + minimal tooltip
        </div>
        <ChartContainer
          theme={cleanTheme}
          height={220}
          width="100%"
          legendVariant="inline"
          tooltipVariant="minimal"
        >
          <LineChart
            categories={WEEKS}
            series={[
              { name: "Revenue", data: DATA.map((row) => row.revenue) },
              { name: "Margin", data: DATA.map((row) => row.margin) },
            ]}
          >
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
          </LineChart>
        </ChartContainer>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Spec — compact legend + dense tooltip
        </div>
        <Chart
          panel={{
            type: "bar",
            encoding: {
              x: { field: "week" },
              y: [{ field: "revenue" }, { field: "margin" }],
            },
            props: {
              legendVariant: "compact",
              tooltipVariant: "dense",
            },
            height: 220,
          }}
          data={DATA}
        />
      </div>
    </div>
  );
}

const meta = {
  title: "Charts/ChromeVariants",
  component: ChromeVariantsDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C72 tooltip/legend chrome variants on ChartContainer and PanelSpec.props — pill/inline/compact legends, card/minimal/dense tooltips.",
      },
    },
  },
} satisfies Meta<typeof ChromeVariantsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LegendAndTooltipVariants: Story = {
  render: () => <ChromeVariantsDemo />,
};
