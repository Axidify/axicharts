# Browser competitive benchmarks

Playwright-driven comparisons of live line-chart updates in Chromium with **4× CPU throttle**.

## Run

```bash
pnpm install
pnpm bench:browser
```

Or include in the full collector:

```bash
pnpm bench:all
```

## Harness

`apps/bench-harness` serves fixed 320×120 line charts for:

| Library | Implementation |
|---------|----------------|
| **AxiCharts** | `ChartContainer` + `LineChart` (uPlot) |
| **Recharts** | `LineChart` + `Line` (`isAnimationActive={false}`) |
| **ECharts** | Canvas line series (`animation: false`) |

Query params: `?lib=axicharts|recharts|echarts&fixture=small|medium|large&panels=1&points=2000`

## Output

`benchmarks/results/<date>/browser-competitive.json` — merged into `benchmarks/BENCHMARKS.md` when using `pnpm bench:all`.
