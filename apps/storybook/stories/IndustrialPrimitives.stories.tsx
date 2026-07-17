import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  Digital,
  Gauge,
  StatusLamp,
} from "@axicharts/charts";
import { industrialTheme } from "@axicharts/charts-theme";
import { useLiveSeries } from "./utils/liveSeries";

function PrimitiveCell({
  title,
  children,
}: {
  title: string;
  children: ReactElement;
}): ReactElement {
  return (
    <div
      style={{
        border: "1px solid #334155",
        borderRadius: 6,
        padding: "8px 10px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#94a3b8",
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function IndustrialPrimitivesMockup(): ReactElement {
  const oee = useLiveSeries([72, 74, 78, 81, 79, 83, 86], 5);
  const speed = useLiveSeries([142, 138, 155, 148, 162, 158, 171], 5);
  const oeeValue = oee[oee.length - 1] ?? 0;
  const speedValue = speed[speed.length - 1] ?? 0;

  const lampStatus =
    speedValue > 165 ? "warning" : speedValue > 155 ? "running" : "idle";

  return (
    <div style={{ maxWidth: 720 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <strong style={{ fontSize: 13 }}>line3 · packaging</strong>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Industrial primitives</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
        }}
      >
        <PrimitiveCell title="OEE">
          <ChartContainer
            theme={industrialTheme}
            mode="live"
            height={120}
            width="100%"
            debounceMs={16}
          >
            <Gauge
              value={oeeValue}
              min={0}
              max={100}
              unit="%"
              label="OEE"
              warningAt={75}
              criticalAt={90}
            />
          </ChartContainer>
        </PrimitiveCell>

        <PrimitiveCell title="Line speed">
          <ChartContainer
            theme={industrialTheme}
            mode="live"
            height={120}
            width="100%"
            debounceMs={16}
          >
            <Digital
              value={Math.round(speedValue)}
              unit=" u/min"
              label="Line speed"
              tone={speedValue > 165 ? "warning" : "neutral"}
            />
          </ChartContainer>
        </PrimitiveCell>

        <PrimitiveCell title="Line status">
          <ChartContainer
            theme={industrialTheme}
            mode="live"
            height={120}
            width="100%"
            debounceMs={16}
          >
            <StatusLamp status={lampStatus} label="Line 3" />
          </ChartContainer>
        </PrimitiveCell>
      </div>

      <p style={{ marginTop: 10, fontSize: 11, color: "#64748b" }}>
        Source: MQTT · Gauge (analog + limits), Digital (monospace readout),
        StatusLamp (run/stop/fault) — SVG primitives for HMI panels
      </p>
    </div>
  );
}

const meta = {
  title: "Mockups/Industrial Primitives",
  component: IndustrialPrimitivesMockup,
  parameters: {
    docs: {
      description: {
        component:
          "C1 industrial primitives — Gauge, Digital, and StatusLamp in a 3-up ops panel.",
      },
    },
  },
} satisfies Meta<typeof IndustrialPrimitivesMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LivePanel: Story = {
  render: () => <IndustrialPrimitivesMockup />,
};
