import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, PieChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const INITIAL_SLICES = [
  { name: "Product", value: 48, tone: "info" as const },
  { name: "Services", value: 28, tone: "success" as const },
  { name: "Support", value: 14, tone: "warning" as const },
  { name: "Other", value: 10 },
];

function LiveDonutDemo(): ReactElement {
  const [slices, setSlices] = useState(INITIAL_SLICES);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlices((current) =>
        current.map((slice, index) => ({
          ...slice,
          value: Math.max(
            6,
            slice.value + (index === 0 ? 2 : index === 2 ? -1 : 0),
          ),
        })),
      );
    }, 1800);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ maxWidth: 420 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button type="button" onClick={() => setShowLabels((value) => !value)}>
          {showLabels ? "Hide labels" : "Show labels"}
        </button>
      </div>
      <ChartContainer theme={cleanTheme} mode="live" height={260} width="100%">
        <PieChart slices={slices} innerRadius={42} showLabels={showLabels} />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Live slice updates morph in place · toggle <code>showLabels</code> on donut
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Donut",
  component: LiveDonutDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C82 donut polish — `showLabels` toggle plus live slice morph updates in `mode: live`.",
      },
    },
  },
} satisfies Meta<typeof LiveDonutDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RevenueMix: Story = {
  render: () => <LiveDonutDemo />,
};

export const StaticMix: Story = {
  render: (): ReactElement => (
    <ChartContainer theme={cleanTheme} mode="interactive" height={260} width={360}>
      <PieChart slices={INITIAL_SLICES} innerRadius={42} showLabels />
    </ChartContainer>
  ),
};
