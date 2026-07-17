import type { ReactElement } from "react";
import { ChartContainer } from "@axicharts/charts";
import { TankChart } from "@axicharts/charts-tank";
import "@axicharts/charts-tank/register";
import { industrialTheme } from "@axicharts/charts-theme";

const CODE = `import "@axicharts/charts-tank/register";
import { TankChart } from "@axicharts/charts-tank";
import { ChartContainer } from "@axicharts/charts";

<ChartContainer theme={industrialTheme} height={200} width={140}>
  <TankChart level={68} label="Tank 4" warningAt={75} criticalAt={90} />
</ChartContainer>`;

export function PluginsPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Community plugins</h1>
      <p style={{ color: "#475569", maxWidth: 640 }}>
        Extend AxiCharts with <code>registerChartType</code> packages — exotic visualizations
        without bloating core.
      </p>
      <section
        style={{
          marginTop: 28,
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          background: "#ffffff",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
          <strong>@axicharts/charts-tank</strong>
          <span style={{ marginLeft: 8, fontSize: 12, color: "#64748b" }}>
            Vertical level visualization
          </span>
        </div>
        <div style={{ padding: 16, display: "flex", gap: 16, background: "#0f172a" }}>
          <ChartContainer theme={industrialTheme} width={140} height={200}>
            <TankChart level={42} label="Tank 1" />
          </ChartContainer>
          <ChartContainer theme={industrialTheme} width={140} height={200}>
            <TankChart level={68} label="Tank 2" warningAt={75} />
          </ChartContainer>
          <ChartContainer theme={industrialTheme} width={140} height={200}>
            <TankChart level={91} label="Tank 3" warningAt={75} criticalAt={90} />
          </ChartContainer>
        </div>
        <pre
          style={{
            margin: 0,
            padding: 16,
            background: "#f8fafc",
            fontSize: 11,
            overflow: "auto",
          }}
        >
          {CODE}
        </pre>
      </section>
    </div>
  );
}
