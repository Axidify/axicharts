import type { Meta, StoryObj } from "@storybook/react";
import type { ReactElement } from "react";
import {
  BarChart,
  ChartContainer,
  LineChart,
  PieChart,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const CATEGORIES = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const VALUES_A = [42, 58, 51, 73, 66];
const VALUES_B = [30, 44, 39, 55, 48];

function InteractiveA11yDemo(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 720 }}>
      <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
        C190a/C190b — tab into each chart, arrow-key through points (live region announces
        values), and use <strong>View data table</strong> for a visible tabular fallback.
      </p>
      <ChartContainer width={360} height={280} theme={cleanTheme}>
        <BarChart
          categories={CATEGORIES}
          series={[
            { name: "Signups", data: VALUES_A },
            { name: "Trials", data: VALUES_B },
          ]}
          a11y={{
            keyboardNavigation: { mode: "normal" },
            dataTable: { showToggle: true },
          }}
        />
      </ChartContainer>
      <ChartContainer width={360} height={280} theme={cleanTheme}>
        <LineChart
          categories={CATEGORIES}
          series={[{ name: "Revenue", data: VALUES_A }]}
          a11y={{
            keyboardNavigation: { mode: "serialize" },
            dataTable: { showToggle: true },
          }}
        />
      </ChartContainer>
      <ChartContainer width={360} height={280} theme={cleanTheme}>
        <PieChart
          slices={[
            { name: "Desktop", value: 48 },
            { name: "Mobile", value: 32 },
            { name: "Tablet", value: 20 },
          ]}
          a11y={{
            keyboardNavigation: true,
            dataTable: true,
          }}
        />
      </ChartContainer>
    </div>
  );
}

const meta = {
  title: "Platform/Interactive accessibility",
  component: InteractiveA11yDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C190a/C190b — Highcharts-style keyboard point navigation and visible data table toggle. Opt in via chart `a11y` prop.",
      },
    },
  },
} satisfies Meta<typeof InteractiveA11yDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  render: () => <InteractiveA11yDemo />,
};
