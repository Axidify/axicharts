import type { ReactElement } from "react";

const PACKAGES = [
  { name: "@axicharts/charts", description: "React API — charts, primitives, registry" },
  { name: "@axicharts/charts-theme", description: "clean · live · industrial · presentation themes" },
  { name: "@axicharts/charts-canvas", description: "uPlot line, bar, area (live path)" },
  { name: "@axicharts/charts-echarts", description: "pie, candlestick, waterfall, heatmap" },
  { name: "@axicharts/charts-core", description: "layout math + tick formatters" },
  { name: "@axicharts/charts-spec", description: "templates, planner, eject CLI" },
  { name: "@axicharts/charts-runtime", description: "adapters, embed SDK, spec portability" },
  { name: "@axicharts/charts-tank", description: "community tank level plugin (registerChartType)" },
  { name: "@axicharts/charts-geo", description: "community regional geo map plugin (registerChartType)" },
  { name: "@axicharts/charts-andon", description: "community production andon board plugin (registerChartType)" },
  { name: "@axicharts/charts-sankey", description: "community Sankey flow plugin (registerChartType, ECharts)" },
] as const;

export function PackagesPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Packages</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
            <th style={{ padding: "10px 8px" }}>Package</th>
            <th style={{ padding: "10px 8px" }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {PACKAGES.map((pkg) => (
            <tr key={pkg.name} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "10px 8px" }}>
                <code>{pkg.name}</code>
              </td>
              <td style={{ padding: "10px 8px", color: "#475569" }}>{pkg.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
