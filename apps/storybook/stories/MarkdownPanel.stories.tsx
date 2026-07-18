import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MarkdownPanel } from "@axicharts/charts";
import { Chart } from "@axicharts/charts-spec";

const SHIFT_NOTES = `# Shift handoff

Line 3 is **stable** after the *hopper reset*. Monitor reject rate for the next hour.

## Actions
- Review [runbook](https://example.com/runbook)
- Ack alarms before end of shift
- Log any downtime in the tracker

\`\`\`
tag: line3.reject_rate
threshold: 0.02
\`\`\`
`;

function PanelDemo(): ReactElement {
  return (
    <div
      style={{
        maxWidth: 520,
        padding: 16,
        background: "#0f172a",
        borderRadius: 8,
        border: "1px solid #334155",
      }}
    >
      <MarkdownPanel content={SHIFT_NOTES} surface="dark" title="Shift notes" />
    </div>
  );
}

function SpecPanelDemo(): ReactElement {
  return (
    <div
      style={{
        maxWidth: 520,
        padding: 16,
        background: "#0f172a",
        borderRadius: 8,
        border: "1px solid #334155",
      }}
    >
      <Chart
        panel={{
          type: "markdown",
          title: "Shift notes",
          props: { content: SHIFT_NOTES, surface: "dark" },
        }}
        data={{}}
      />
    </div>
  );
}

const meta = {
  title: "Panels/MarkdownPanel",
  component: PanelDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C87 markdown / text panel — shift notes and annotations via `MarkdownPanel` or charts-spec `type: markdown`.",
      },
    },
  },
} satisfies Meta<typeof PanelDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ShiftNotes: Story = {
  render: () => <PanelDemo />,
};

export const FromSpec: Story = {
  render: () => <SpecPanelDemo />,
};
