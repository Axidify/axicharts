# AxiCharts

[![npm version](https://img.shields.io/npm/v/@axicharts/charts.svg)](https://www.npmjs.com/package/@axicharts/charts)
[![CI](https://github.com/Axidify/axicharts/actions/workflows/ci.yml/badge.svg)](https://github.com/Axidify/axicharts/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**MIT React charts for dashboards** — composable JSX, optional JSON spec, canvas when panels go live.

- **npm:** [@axicharts/charts](https://www.npmjs.com/package/@axicharts/charts) · [@axicharts/charts-theme](https://www.npmjs.com/package/@axicharts/charts-theme)
- **Docs:** https://axidify.github.io/axicharts/
- **Storybook:** `pnpm storybook` → http://localhost:6006
- **Render sandbox:** `pnpm render-sandbox` → http://localhost:3010
- **Issues:** https://github.com/Axidify/axicharts/issues

---

## Start here

**Goal:** one themed line chart in a React app — smallest install, no spec layer.

### 1. Install (line-only)

```bash
pnpm add @axicharts/charts @axicharts/charts-theme uplot
```

Peers: `react`, `react-dom`, `uplot`. **No `echarts` required** for line/bar/area — see [import guide](https://axidify.github.io/axicharts/guides/imports).

### 2. Render

```tsx
import { QuickLineChart } from "@axicharts/charts/quick";

export function LatencySparkline() {
  return (
    <QuickLineChart
      data={[42, 38, 55, 49, 62, 58, 71]}
      labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
      title="p95 latency"
    />
  );
}
```

`QuickLineChart` wraps `ChartContainer` + `LineChart` with `cleanTheme` and sensible defaults.

### 3. Theme

```tsx
import { cleanTheme, createTheme } from "@axicharts/charts-theme";

const brandTheme = createTheme(cleanTheme, {
  name: "acme",
  bar: { radius: 8 },
});
```

Copy `tokens.css` from `@axicharts/charts-theme` for shadcn `--chart-*` alignment.

### 4. Layout + grow

`ChartContainer` needs an explicit height (or `minHeight`) in flex/grid layouts:

```tsx
import { ChartContainer, LineChart } from "@axicharts/charts/cartesian";
import { cleanTheme } from "@axicharts/charts-theme";

<ChartContainer theme={cleanTheme} minHeight={280}>
  <LineChart
    categories={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
    series={[{ name: "p95", data: [42, 38, 55, 49, 62, 58, 71] }]}
    fill
  />
</ChartContainer>
```

**Scaffold:** `npx @axicharts/charts create-dashboard my-app --category cartesian`

**Choosing your path:** [docs /guides/choosing-your-path](https://axidify.github.io/axicharts/guides/choosing-your-path)

---

## Advanced

Use these when you outgrow hand-built JSX — agents, codegen, or portable dashboard JSON.

### Agent-safe cartesian spec

One `type: "cartesian"` panel with composable `marks[]`, validated **before** render:

```ts
import { Chart, validateCartesianSpec, normalizeToCartesian } from "@axicharts/charts-spec";

const panel = normalizeToCartesian(rawPanel);
const check = validateCartesianSpec(panel, { rows: data });
if (!check.ok) throw check.errors; // UNKNOWN_FIELD + suggestions

<Chart panel={panel} data={data} />
```

```json
{
  "type": "cartesian",
  "encoding": { "x": { "field": "week" } },
  "marks": [
    { "mark": "bar", "field": "revenue", "label": "Revenue" },
    { "mark": "line", "field": "target", "label": "Target" },
    { "mark": "rule", "value": 50, "label": "Quota" }
  ]
}
```

- Full guide: [packages/charts-spec/CARTESIAN.md](./packages/charts-spec/CARTESIAN.md)
- Playground: [docs /spec/blocks](https://axidify.github.io/axicharts/spec/blocks)
- Eject to JSX: `npx @axicharts/charts-spec eject panel.json`
- Agent tutorial: [docs /guides/agent-cartesian](https://axidify.github.io/axicharts/guides/agent-cartesian)

### Migrating from Recharts / shadcn Charts

Secondary path — not the default front door:

- Gallery: [docs /shadcn](https://axidify.github.io/axicharts/shadcn)
- Registry: [docs /shadcn/registry](https://axidify.github.io/axicharts/shadcn/registry)
- `chartConfig`, `<Cell fill />`, spec `encoding.color` parity

### Live ops dashboards

`mode="live"` + `liveTheme` for 5–10 Hz panels. Brush sync across charts: Storybook **Charts/BrushSync**. Compare: [docs /compare](https://axidify.github.io/axicharts/compare).

---

## Architecture

Full platform stack — optional until you need embed, planner, or breadth chart types.

| Package | Role |
|---------|------|
| `@axicharts/charts` | React API — import **subpaths** (`/cartesian`, `/quick`, …) not root when possible |
| `@axicharts/charts-theme` | `cleanTheme`, `liveTheme`, `industrialTheme`, `tokens.css` |
| `@axicharts/charts-spec` | Templates, `validateCartesianSpec`, eject CLI |
| `@axicharts/charts-runtime` | Embed SDK, adapters, mosaic layout |
| `@axicharts/charts-planner` | Server planner — intent → panels (optional) |
| `@axicharts/charts-full` | Meta-package — everything + spec + runtime |

**Import cheat sheet:** [docs /guides/imports](https://axidify.github.io/axicharts/guides/imports) · **Bundle sizes:** [docs /benchmarks](https://axidify.github.io/axicharts/benchmarks) · **Troubleshooting:** [docs /guides/troubleshooting](https://axidify.github.io/axicharts/guides/troubleshooting)

**Batteries-included install** (pie, candlestick, heatmap, spec, runtime):

```bash
pnpm add @axicharts/charts-full echarts uplot
```

Product RFCs and roadmap: [axiboard docs](https://github.com/Axidify/axiboard/tree/main/docs/charts)

---

## Develop

```bash
pnpm install
pnpm build
pnpm test
pnpm storybook
pnpm docs        # → http://localhost:3001
pnpm size        # bundle gzip budgets
```

## Community

- [Contributing](./CONTRIBUTING.md) · [Code of conduct](./CODE_OF_CONDUCT.md) · [Changelog](./CHANGELOG.md)
- Adoption track: [Axidify/axicharts#3](https://github.com/Axidify/axicharts/issues/3)

## License

MIT
