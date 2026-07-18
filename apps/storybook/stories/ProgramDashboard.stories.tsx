import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { compileTemplate } from "@axicharts/charts-spec";
import "@axicharts/charts-gantt/register";

const REMAINING = 34;
const IDEAL_REMAINING = 12;
const BLOCKED = 6;

function SprintChip({ label }: { label: string }): ReactElement {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 999,
        background: "#f1f5f9",
        color: "#64748b",
      }}
    >
      {label}
    </span>
  );
}

function ProgramDashboardMockup(): ReactElement {
  const behindIdeal = REMAINING > IDEAL_REMAINING;

  return (
    <div
      style={{
        maxWidth: 920,
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        background: "#f8fafc",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          borderBottom: "1px solid #e2e8f0",
          background: "#ffffff",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
          Program dashboard · Sprint 24
        </span>
        <SprintChip label="burndown" />
        <SprintChip label="velocity" />
        <SprintChip label="gantt plugin" />
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 11,
            color: "#64748b",
            background: "#f1f5f9",
            borderRadius: 999,
            padding: "3px 8px",
          }}
        >
          Ends in 4d
        </span>
      </div>

      <div style={{ padding: 16 }}>
        {behindIdeal ? (
          <div
            style={{
              marginBottom: 12,
              fontSize: 11,
              color: "#9a3412",
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: 8,
              padding: "8px 10px",
            }}
          >
            Burndown behind ideal — {REMAINING} pts remaining vs {IDEAL_REMAINING} ideal
            at D10
          </div>
        ) : null}

        <div
          style={{
            marginBottom: 12,
            fontSize: 11,
            color: "#991b1b",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "8px 10px",
          }}
        >
          {BLOCKED} stories blocked — review before sprint close
        </div>

        {compileTemplate("program-dashboard", {}, { theme: "clean", mode: "interactive" })}

        <p style={{ marginTop: 10, fontSize: 11, color: "#64748b" }}>
          program-dashboard template · burndown threshold band · stacked velocity ·
          status donut · delivery funnel · Gantt today marker
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: "Mockups/Q · Program Dashboard",
  component: ProgramDashboardMockup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Round 3 acceptance target (5/5) — sprint header chips, burndown-behind-ideal callout, blocked stories banner, program-dashboard template with Gantt plugin.",
      },
    },
  },
} satisfies Meta<typeof ProgramDashboardMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SprintWall: Story = {
  render: () => <ProgramDashboardMockup />,
};
