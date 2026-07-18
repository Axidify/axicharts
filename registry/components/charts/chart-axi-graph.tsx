"use client";

import {
  GraphChart,
  ChartContainer,
} from "@axicharts/charts/network";
import { cleanTheme } from "@axicharts/charts-theme";

export function ChartAxiGraph() {
  return (
    <ChartContainer theme={cleanTheme} height={360} width={640}>
      <GraphChart
        data={{
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
        }}
        showLegend
      />
    </ChartContainer>
  );
}
