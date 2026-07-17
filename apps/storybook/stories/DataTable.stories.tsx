import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "@axicharts/charts";

const POSITIONS = [
  {
    symbol: "AAPL",
    side: "LONG",
    qty: 400,
    avg: "182.10",
    pnl: "+$360",
    pnlTone: "success",
  },
  {
    symbol: "NVDA",
    side: "LONG",
    qty: 120,
    avg: "118.40",
    pnl: "-$84",
    pnlTone: "critical",
  },
  {
    symbol: "MSFT",
    side: "SHORT",
    qty: 200,
    avg: "428.20",
    pnl: "+$120",
    pnlTone: "success",
  },
];

function TableDemo(): ReactElement {
  return (
    <div
      style={{
        maxWidth: 640,
        padding: 16,
        background: "#0f172a",
        borderRadius: 8,
        border: "1px solid #334155",
      }}
    >
      <DataTable
        columns={[
          { key: "symbol", label: "Symbol", monospace: true },
          { key: "side", label: "Side" },
          { key: "qty", label: "Qty", align: "right", monospace: true },
          { key: "avg", label: "Avg", align: "right", monospace: true },
          {
            key: "pnl",
            label: "P&L",
            align: "right",
            monospace: true,
            toneKey: "pnlTone",
          },
        ]}
        rows={POSITIONS}
        surface="dark"
        compact
        caption="Open positions — C2 table panel"
      />
    </div>
  );
}

const meta = {
  title: "Panels/DataTable",
  component: TableDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C2 non-chart table panel — positions, alarm lists, and tag tables via charts-spec `type: table`.",
      },
    },
  },
} satisfies Meta<typeof TableDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenPositions: Story = {
  render: () => <TableDemo />,
};
