# @axicharts/charts-full

Batteries-included meta-package for the AxiCharts platform — one install for the full chart catalog, spec compiler, dashboard runtime, and themes.

**Direction:** Cartesian building blocks — `type: "cartesian"` + `marks[]` with `validateCartesianSpec` for agent-safe specs. See [charts-spec/CARTESIAN.md](../charts-spec/CARTESIAN.md).

```bash
npm install @axicharts/charts-full echarts uplot
```

**Peer dependencies:** `react`, `react-dom`, `echarts`, `uplot`.

## When to use

| Install | Use when |
|---------|----------|
| **`@axicharts/charts-full`** | New dashboards that need charts + spec + runtime + theme without picking packages |
| `@axicharts/charts/cartesian` (etc.) | Tree-shaken category installs — smallest bundle for a known chart family |
| `@axicharts/charts/line` (etc.) | Single-chart subpaths for minimal entry size |

## Imports

```tsx
import { ChartContainer, LineChart, compilePanel } from "@axicharts/charts-full";
import { cleanTheme } from "@axicharts/charts-full/theme";
import { buildMosaicPreset } from "@axicharts/charts-full/runtime";
import { ejectPanel } from "@axicharts/charts-full/spec";
```

The main entry re-exports `@axicharts/charts/full` (all chart components + registry helpers). Subpaths mirror the underlying platform packages without duplicating chart code.

## Optional extensions

Community / satellite packages are **not** bundled — add them when needed:

- `@axicharts/charts-map` — TopoJSON choropleth
- `@axicharts/charts-sankey` — Sankey flow
- `@axicharts/charts-gantt` — SVG Gantt timeline
- `@axicharts/charts-geo`, `@axicharts/charts-tank`, `@axicharts/charts-andon`

## Scaffold

```bash
npx @axicharts/charts create-dashboard my-app --preset full
```

See the [monorepo README](https://github.com/Axidify/axicharts).
