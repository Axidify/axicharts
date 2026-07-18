# @axicharts/charts

[![npm version](https://img.shields.io/npm/v/@axicharts/charts.svg)](https://www.npmjs.com/package/@axicharts/charts)

Layer 1 React chart API for AxiCharts — `ChartContainer`, line/bar/area charts, industrial primitives, and `registerChartType` extension registry.

**Direction:** Cartesian **building blocks** — `type: "cartesian"` + `marks[]` for agent-safe specs; public `CartesianChart` composable shell (C137). Today: `LineChart` / `ComboChart` presets compile to the same render path. See [charts-spec/CARTESIAN.md](../charts-spec/CARTESIAN.md).

**Recommended batteries-included install:**

```bash
npm install @axicharts/charts-full echarts uplot
```

**Modular (category subpaths for smallest bundle):**

```bash
npm install @axicharts/charts @axicharts/charts-theme echarts uplot
```

**shadcn custom registry** — [install guide](https://axidify.github.io/axicharts/shadcn/registry) · [vs Recharts](https://axidify.github.io/axicharts/compare) · [benchmarks](https://github.com/Axidify/axicharts/blob/main/benchmarks/BENCHMARKS.md)

See the [monorepo README](https://github.com/Axidify/axicharts).
