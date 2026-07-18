import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, EChartsOptionChart } from "@axicharts/charts";
import { Chart } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";

const CUSTOM_GAUGE_PANEL = {
  specVersion: 1,
  type: "echarts" as const,
  title: "Custom gauge",
  theme: "clean" as const,
  height: 280,
  props: {
    option: {
      series: [
        {
          type: "gauge",
          startAngle: 200,
          endAngle: -20,
          progress: { show: true, width: 14 },
          axisLine: { lineStyle: { width: 14 } },
          pointer: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: true,
            fontSize: 28,
            offsetCenter: [0, "10%"],
            formatter: "{value}%",
          },
          data: [{ value: 72, name: "Utilization" }],
        },
      ],
    },
  },
};

const CUSTOM_BAR_OPTION = {
  tooltip: { trigger: "axis" as const },
  xAxis: {
    type: "category" as const,
    data: ["Build", "Test", "Deploy", "Monitor"],
  },
  yAxis: { type: "value" as const },
  series: [
    {
      type: "bar" as const,
      name: "Minutes",
      data: [18, 42, 12, 28],
      itemStyle: { borderRadius: [6, 6, 0, 0] },
    },
  ],
};

function DirectEscapeHatch(): ReactElement {
  return (
    <div style={{ maxWidth: 520 }}>
      <ChartContainer theme={cleanTheme} height={280} width="100%">
        <EChartsOptionChart option={CUSTOM_BAR_OPTION} />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        C121 — pass a raw ECharts option when typed chart components are not enough.
      </p>
    </div>
  );
}

function SpecCompiled(): ReactElement {
  return (
    <div style={{ maxWidth: 360 }}>
      <Chart panel={CUSTOM_GAUGE_PANEL} data={{}} />
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        compilePanel type: &quot;echarts&quot; from panel JSON fixture.
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/ECharts escape hatch",
  component: DirectEscapeHatch,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C121 EChartsOptionChart escape hatch — raw ECharts option passthrough with ChartContainer theme/mode integration.",
      },
    },
  },
} satisfies Meta<typeof DirectEscapeHatch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RawOption: Story = {
  render: () => <DirectEscapeHatch />,
};

export const FromSpec: Story = {
  render: () => <SpecCompiled />,
};
