# Published benchmarks

Reproducible numbers for bundle gzip budgets and live-update latency.

**Collected:** 2026-07-17T21:26:11.238Z  
**Environment:** Node v24.16.0, darwin arm64, happy-dom (node proxy), Chromium 4× (browser competitive), Chromium 4× (soak + leak)  
**Results:** `benchmarks/results/2026-07-17/summary.json`

Re-run locally:

```bash
pnpm bench              # node proxy gates + bundle
pnpm bench:browser      # Chromium competitive table
pnpm bench:stability    # 60s soak @ 1/5 Hz + leak check
pnpm bench:all          # node + competitive browser
```

Methodology: axiboard [PERFORMANCE.md](https://github.com/Axidify/axiboard/blob/main/docs/charts/PERFORMANCE.md).

**Docs:** [axidify.github.io/axicharts/benchmarks](https://axidify.github.io/axicharts/benchmarks) — category subpath table + line-only recipe.

## Category entry subpaths (gzip, `pnpm size`)

Measured entry-shim gzip — peers (`uplot`, `echarts`) excluded. CI: `.size-limit.json`.

| Subpath | Entry gzip | Peers | Charts |
|---------|------------|-------|--------|
| `@axicharts/charts/quick` | 669 B | uplot | QuickLineChart |
| `@axicharts/charts/cartesian` | 1.26 KB | uplot | Line, area, bar, combo, scatter |
| `@axicharts/charts/distribution` | 743 B | echarts | Pie, funnel, boxplot, … |
| `@axicharts/charts/financial` | 593 B | echarts | Waterfall, candlestick |
| `@axicharts/charts/matrix` | 780 B | echarts | Heatmap, radar, treemap, … |
| `@axicharts/charts (root)` | 2.03 KB | echarts + uplot | Full barrel — discouraged |

Line-only dashboard: `pnpm add @axicharts/charts @axicharts/charts-theme uplot` — no `echarts`.

## Bundle size (gzip)

| Package | Size | Budget | Pass |
|---------|------|--------|------|
| @axicharts/charts | 5.5 KB | 13.7 KB | ✅ |
| @axicharts/charts-canvas | 4.2 KB | 5.9 KB | ✅ |
| @axicharts/charts-echarts | 5.1 KB | 7.8 KB | ✅ |
| @axicharts/charts-core | 1.5 KB | 2.9 KB | ✅ |
| @axicharts/charts-theme | 0.3 KB | 2.0 KB | ✅ |
| @axicharts/charts-spec | 0.4 KB | 7.8 KB | ✅ |
| @axicharts/charts-runtime | 5.5 KB | 5.9 KB | ✅ |
| @axicharts/charts-tank | 0.1 KB | 2.9 KB | ✅ |
| @axicharts/charts-geo | 0.1 KB | 2.9 KB | ✅ |
| @axicharts/charts-andon | 0.1 KB | 2.9 KB | ✅ |
| @axicharts/charts-gantt | 0.1 KB | 2.9 KB | ✅ |

## Node update latency p95 (ms)

| Fixture | Scenario | p95 | Budget | Pass |
|---------|----------|-----|--------|------|
| small | 500 pts × 1 series | 0.01 | 8 | ✅ |
| medium | 5000 pts × 1 series | 0.03 | 16 | ✅ |
| dashboard-6up | 6 panels × 2000 pts | 0.38 | 16 | ✅ |
| large | 10000 pts × 1 series | 0.04 | 16 | ✅ |
| multi-series | 10000 pts × 4 series | 0.41 | 16 | ✅ |

## Browser competitive update p95 (Chromium 4× CPU)

| Fixture | Scenario | AxiCharts | Recharts | ECharts |
|---------|----------|-----------|----------|---------|
| small | 500 pts | 2.10 ms | 5.60 ms | 5.20 ms |
| medium | 5000 pts | 2.20 ms | 22.10 ms | 9.50 ms |
| large | 10000 pts | 2.40 ms | 39.10 ms | 15.50 ms |
| dashboard-6up | 6 panels × 2000 pts | 2.90 ms | 54.30 ms | 26.50 ms |

Profile: Chromium headless, viewport 1280×720, `flushSync` state updates, 30 frames per scenario. Harness: `apps/bench-harness`.

**C101 exotic live path:** Pie, candlestick, and funnel ECharts adapters use the same `mergeOption` + `lazyUpdate` + `replaceMerge: ['series']` path as heatmap when `mode: "live"`. Storybook `Charts/Live ECharts breadth` exercises all three @ 5 Hz; cartesian competitive numbers above remain the published bench — exotic types share the merge machinery without a separate harness fixture yet.


## Browser stability (Chromium 4× CPU)

### Soak update p95

| Scenario | Profile | p95 | Budget (ms) | Pass |
|----------|---------|-----|-------------|------|
| soak-large-1hz | 10000 pts @ 1 Hz × 60s | 6.50 ms | 16 | ✅ |
| soak-large-5hz | 10000 pts @ 5 Hz × 60s | 4.30 ms | 16 | ✅ |

### Leak check

| Scenario | Cycles | Result | Pass |
|----------|--------|--------|------|
| leak-mount-100 | 100 cycles | leftover uPlot: 0, heap Δ 0.0 MB | ✅ |

## Fixtures

| File | Points | Series | Purpose |
|------|--------|--------|---------|
| `small.json` | 500 | 1 | SVG-scale update path |
| `medium.json` | 5,000 | 1 | Mid-size live panel |
| `large.json` | 10,000 | 1 | Canvas-scale path |
| `multi-series.json` | 10,000 | 4 | Multi-series canvas |
| `dashboard-6up.json` | 6 × 2,000 | 1 | Multi-panel frame budget |
