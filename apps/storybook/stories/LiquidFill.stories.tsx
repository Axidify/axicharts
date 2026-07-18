import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  LiquidFillChart,
} from "@axicharts/charts/liquid-fill";
import { compilePanel } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";
import tankFixture from "../../../packages/charts-spec/examples/liquid-fill-tank.panel.json";

function LiquidFillStaticDemo(): ReactElement {
  return (
    <div style={{ maxWidth: 360 }}>
      <ChartContainer theme={cleanTheme} height={280} width={320}>
        <LiquidFillChart value={0.72} label="Tank A" />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        C126 liquid fill — tank utilization @ 72%
      </p>
    </div>
  );
}

function LiquidFillLiveDemo(): ReactElement {
  const [value, setValue] = useState(0.62);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setValue((current) => {
        const next = current + 0.02;
        return next > 0.95 ? 0.55 : next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ maxWidth: 360 }}>
      <ChartContainer theme={cleanTheme} height={280} width={320} mode="live">
        <LiquidFillChart value={value} label="Tank A" />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Live mode — level ticks via `mergeOption` @ 1 Hz
      </p>
    </div>
  );
}

function LiquidFillSpecDemo(): ReactElement {
  const rows = useMemo(() => [{ level: 0.72 }], []);
  const panel = useMemo(() => compilePanel(tankFixture, rows), [rows]);

  return (
    <div style={{ maxWidth: 360 }}>
      {panel}
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Spec-compiled from `liquid-fill-tank.panel.json`
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Liquid fill",
  component: LiquidFillStaticDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C126 Liquid fill gauge — ECharts liquidFill series via lazy echarts-liquidfill; tank levels and utilization blobs; spec `type: liquid-fill`.",
      },
    },
  },
} satisfies Meta<typeof LiquidFillStaticDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TankUtilization: Story = {
  render: () => <LiquidFillStaticDemo />,
};

export const LiveLevelTick: Story = {
  render: () => <LiquidFillLiveDemo />,
};

export const SpecFixture: Story = {
  render: () => <LiquidFillSpecDemo />,
};
