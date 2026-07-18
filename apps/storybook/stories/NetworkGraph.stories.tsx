import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  GraphChart,
  ChartContainer,
  type GraphChartData,
} from "@axicharts/charts/network";
import { compilePanel } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";
import graphFixture from "../../../packages/charts-spec/examples/graph-service-topology.panel.json";

const SERVICE_TOPOLOGY: GraphChartData = {
  categories: [
    { name: "Gateway" },
    { name: "Core" },
    { name: "Data" },
  ],
  nodes: [
    { id: "api-gateway", name: "API Gateway", category: "Gateway", value: 1200, tone: "info" },
    { id: "auth-service", name: "Auth", category: "Core", value: 420, tone: "success" },
    { id: "user-service", name: "Users", category: "Core", value: 680 },
    { id: "order-service", name: "Orders", category: "Core", value: 540, tone: "warning" },
    { id: "payment-service", name: "Payments", category: "Core", value: 310 },
    { id: "inventory-service", name: "Inventory", category: "Data", value: 260 },
    { id: "notification-service", name: "Notify", category: "Data", value: 180 },
  ],
  edges: [
    { source: "api-gateway", target: "auth-service", value: 420 },
    { source: "api-gateway", target: "user-service", value: 680 },
    { source: "api-gateway", target: "order-service", value: 540 },
    { source: "order-service", target: "payment-service", value: 310 },
    { source: "order-service", target: "inventory-service", value: 260 },
    { source: "user-service", target: "notification-service", value: 180 },
    { source: "payment-service", target: "notification-service", value: 95 },
  ],
};

const FIXTURE_ROWS = [
  { source: "api-gateway", target: "auth-service", rps: 420 },
  { source: "api-gateway", target: "user-service", rps: 680 },
  { source: "api-gateway", target: "order-service", rps: 540 },
  { source: "order-service", target: "payment-service", rps: 310 },
  { source: "order-service", target: "inventory-service", rps: 260 },
  { source: "user-service", target: "notification-service", rps: 180 },
  { source: "payment-service", target: "notification-service", rps: 95 },
];

function GraphStaticDemo(): ReactElement {
  return (
    <div style={{ maxWidth: 760 }}>
      <ChartContainer theme={cleanTheme} height={400} width={720}>
        <GraphChart data={SERVICE_TOPOLOGY} showLegend />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        C128 network graph — microservice dependency mesh (force layout)
      </p>
    </div>
  );
}

function GraphLiveDemo(): ReactElement {
  const [data, setData] = useState(SERVICE_TOPOLOGY);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setData((current) => ({
        ...current,
        nodes: current.nodes.map((node) => ({
          ...node,
          value: Math.max(
            80,
            Math.round((node.value ?? 200) * (0.92 + Math.random() * 0.16)),
          ),
        })),
      }));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ maxWidth: 760 }}>
      <ChartContainer theme={cleanTheme} height={400} width={720} mode="live">
        <GraphChart data={data} />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Live mode — node value pulse @ 1 Hz (symbol size updates)
      </p>
    </div>
  );
}

function GraphSpecDemo(): ReactElement {
  const rows = useMemo(() => FIXTURE_ROWS, []);
  const panel = useMemo(() => compilePanel(graphFixture, rows), [rows]);

  return (
    <div style={{ maxWidth: 760 }}>
      {panel}
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Spec-compiled from `graph-service-topology.panel.json`
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Network graph",
  component: GraphStaticDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C128 Network graph — ECharts `graph` series with force layout for service topology; spec `type: graph`.",
      },
    },
  },
} satisfies Meta<typeof GraphStaticDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ServiceTopology: Story = {
  render: () => <GraphStaticDemo />,
};

export const LiveNodePulse: Story = {
  render: () => <GraphLiveDemo />,
};

export const SpecFixture: Story = {
  render: () => <GraphSpecDemo />,
};
