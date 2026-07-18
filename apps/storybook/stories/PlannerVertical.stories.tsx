import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { planFromIntent } from "@axicharts/charts-planner";

function PanelJson({ title, plan }: { title: string; plan: ReturnType<typeof planFromIntent> }): ReactElement {
  const panel = plan.panels[0];
  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
        {title}
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>
        template: {plan.template} · panel type: {panel?.type}
      </div>
      <pre
        style={{
          fontSize: 11,
          background: "#f8fafc",
          padding: 12,
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        {JSON.stringify(panel, null, 2)}
      </pre>
    </div>
  );
}

function FinanceVerticalDemo(): ReactElement {
  const plan = planFromIntent(
    {
      metrics: [{ name: "revenue", unit: "USD" }],
      fields: ["period", "revenue", "margin", "vsPlan"],
    },
    "Finance revenue vs margin dual axis combo vs plan",
  );
  return <PanelJson title="C90 finance — combo + vsPlan color" plan={plan} />;
}

function TradingVerticalDemo(): ReactElement {
  const plan = planFromIntent(
    {
      metrics: [{ name: "AAPL", kind: "ohlc" }],
      fields: ["time", "open", "high", "low", "close", "volume"],
    },
    "Trading blotter candlestick with volume brush sync",
  );
  return <PanelJson title="C90 trading — candlestick brush + volume" plan={plan} />;
}

function OpsVerticalDemo(): ReactElement {
  const plan = planFromIntent(
    {
      metrics: [{ name: "p95_latency", unit: "ms" }],
      fields: ["time", "p95_latency", "meets_slo"],
    },
    "Ops line 3 latency vs SLO threshold band",
  );
  return <PanelJson title="C90 ops — SLO threshold bands" plan={plan} />;
}

const meta = {
  title: "Spec/PlannerVertical",
  component: FinanceVerticalDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C90 vertical rule packs infer richer PanelSpec for finance, trading, and ops intents beyond C71/C78 color/size/curve encoding.",
      },
    },
  },
} satisfies Meta<typeof FinanceVerticalDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FinanceCombo: Story = {
  render: () => <FinanceVerticalDemo />,
};

export const TradingCandlestick: Story = {
  render: () => <TradingVerticalDemo />,
};

export const OpsSloBands: Story = {
  render: () => <OpsVerticalDemo />,
};
