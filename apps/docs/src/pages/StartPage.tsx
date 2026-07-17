import type { ReactElement } from "react";
import { ChartContainer, LineChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const CODE = `import { ChartContainer, LineChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

export function LatencyPanel() {
  return (
    <ChartContainer theme={cleanTheme} height={200}>
      <LineChart
        categories={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
        series={[{ name: "p95", data: [42, 38, 55, 49, 62, 58, 71] }]}
        fill
      />
    </ChartContainer>
  );
}`;

export function StartPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Getting started</h1>
      <h2 style={{ fontSize: 16 }}>Install</h2>
      <pre
        style={{
          padding: 14,
          borderRadius: 8,
          background: "#0f172a",
          color: "#e2e8f0",
          fontSize: 12,
          overflow: "auto",
        }}
      >
        {`npm install @axicharts/charts @axicharts/charts-theme echarts uplot`}
      </pre>
      <h2 style={{ fontSize: 16, marginTop: 28 }}>Live example</h2>
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 16,
          background: "#fff",
          maxWidth: 640,
        }}
      >
        <ChartContainer theme={cleanTheme} height={200}>
          <LineChart
            categories={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            series={[{ name: "p95", data: [42, 38, 55, 49, 62, 58, 71] }]}
            fill
          />
        </ChartContainer>
      </div>
      <h2 style={{ fontSize: 16, marginTop: 28 }}>Source</h2>
      <pre
        style={{
          padding: 14,
          borderRadius: 8,
          background: "#f1f5f9",
          fontSize: 11,
          overflow: "auto",
        }}
      >
        {CODE}
      </pre>
    </div>
  );
}
