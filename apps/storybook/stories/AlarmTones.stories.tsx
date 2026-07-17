import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  Gauge,
  LineChart,
  Stat,
  readTagTones,
} from "@axicharts/charts";
import { industrialTheme } from "@axicharts/charts-theme";

const DAYS = ["09:00", "09:05", "09:10", "09:15", "09:20", "09:25"];
const CPU = [42, 48, 55, 61, 58, 64];
const MEMORY = [68, 70, 72, 71, 73, 75];

const RUNTIME_DATA = {
  alarms: [
    { id: "cpu", message: "CPU above warn threshold", severity: "warning", tag: "cpu" },
    { id: "memory", message: "Memory critical", severity: "critical", tag: "memory" },
  ],
};

function AlarmTonePanel(): ReactElement {
  const tagTones = readTagTones(RUNTIME_DATA);

  return (
    <div
      style={{
        maxWidth: 560,
        padding: 16,
        background: "#0f172a",
        borderRadius: 8,
        border: "1px solid #334155",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <ChartContainer theme={industrialTheme} height={72} tagTones={tagTones}>
          <Stat value="64%" label="cpu" surface="dark" monospace />
        </ChartContainer>
        <ChartContainer theme={industrialTheme} height={72} tagTones={tagTones}>
          <Stat value="75%" label="memory" surface="dark" monospace />
        </ChartContainer>
      </div>
      <ChartContainer
        theme={industrialTheme}
        mode="live"
        height={180}
        width="100%"
        tagTones={tagTones}
      >
        <LineChart
          categories={DAYS}
          series={[
            { name: "cpu", data: CPU },
            { name: "memory", data: MEMORY },
          ]}
          fill
        />
      </ChartContainer>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        <ChartContainer theme={industrialTheme} height={120} width="100%" tagTones={tagTones}>
          <Gauge value={64} label="cpu" unit="%" warningAt={75} criticalAt={90} />
        </ChartContainer>
        <ChartContainer theme={industrialTheme} height={120} width="100%" tagTones={tagTones}>
          <Gauge value={75} label="memory" unit="%" warningAt={75} criticalAt={90} />
        </ChartContainer>
      </div>
      <p style={{ marginTop: 12, fontSize: 11, color: "#94a3b8" }}>
        Alarm severities in runtime data map to series/stat/gauge tones via tagTones.
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Alarm Tones",
  component: AlarmTonePanel,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C2 alarm tone propagation — data.alarms / data.tones drive warning and critical colors on matching tag names.",
      },
    },
  },
} satisfies Meta<typeof AlarmTonePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpsWall: Story = {
  render: () => <AlarmTonePanel />,
};
