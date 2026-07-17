import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AlertPanel } from "@axicharts/charts";
import { useState } from "react";

const SEED_ALARMS = [
  {
    id: "cpu",
    message: "CPU above warn threshold",
    severity: "warning" as const,
    tag: "cpu",
    timestamp: Date.now() - 60_000,
  },
  {
    id: "memory",
    message: "Memory critical on Line 3",
    severity: "critical" as const,
    tag: "memory",
    timestamp: Date.now() - 15_000,
  },
  {
    id: "comm",
    message: "PLC comms degraded",
    severity: "alarm" as const,
    tag: "plc",
    timestamp: Date.now() - 5_000,
  },
];

function InteractiveAlertPanel(): ReactElement {
  const [alarms, setAlarms] = useState(SEED_ALARMS);

  return (
    <div style={{ maxWidth: 420, padding: 16, background: "#0f172a", borderRadius: 8 }}>
      <AlertPanel
        alarms={alarms}
        surface="dark"
        onAck={(id) => {
          setAlarms((current) =>
            current.map((alarm) =>
              alarm.id === id ? { ...alarm, acknowledged: true } : alarm,
            ),
          );
        }}
        onShelve={(id) => {
          setAlarms((current) => current.filter((alarm) => alarm.id !== id));
        }}
      />
    </div>
  );
}

const meta = {
  title: "Panels/AlertPanel",
  component: InteractiveAlertPanel,
  parameters: { layout: "padded" },
} satisfies Meta<typeof InteractiveAlertPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AckAndShelve: Story = {
  render: () => <InteractiveAlertPanel />,
};
