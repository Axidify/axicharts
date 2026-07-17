import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, LineChart } from "@axicharts/charts";
import { liveTheme } from "@axicharts/charts-theme";

const POINT_COUNT = 12_000;
const categories = Array.from({ length: POINT_COUNT }, (_, index) => {
  const minute = index % 60;
  const hour = Math.floor(index / 60) % 24;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});
const series = [
  {
    name: "Throughput",
    data: Array.from({ length: POINT_COUNT }, (_, index) => {
      const wave = Math.sin(index / 40) * 12;
      const spike = index % 173 === 0 ? 45 : 0;
      return 68 + wave + spike;
    }),
    tone: "info" as const,
  },
];

function DenseLineDemo(): ReactElement {
  return (
    <div style={{ maxWidth: 720 }}>
      <ChartContainer theme={liveTheme} mode="live" height={280} width="100%">
        <LineChart
          categories={categories}
          series={series}
          renderer="auto"
          refreshHz={5}
          fill
        />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        {POINT_COUNT.toLocaleString()} points · LTTB auto-sampled via{" "}
        <code>renderer=&quot;auto&quot;</code>
      </p>
    </div>
  );
}

const meta = {
  title: "Performance/Dense Line",
  component: DenseLineDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C2 LTTB downsampling — large live series auto-sampled to ~2× plot width.",
      },
    },
  },
} satisfies Meta<typeof DenseLineDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwelveThousandPoints: Story = {
  render: () => <DenseLineDemo />,
};
