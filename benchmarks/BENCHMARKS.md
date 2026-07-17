# Published benchmarks

Reproducible numbers for bundle gzip budgets and uPlot live-update latency.

**Collected:** 2026-07-17T21:11:51.250Z  
**Environment:** Node v24.16.0, darwin arm64, happy-dom (canvas proxy)  
**Results:** `benchmarks/results/2026-07-17/summary.json`

Re-run locally:

```bash
pnpm bench
```

Methodology (fixtures, budgets, browser profile for future Playwright benches) is documented in Dashboarder [PERFORMANCE.md](https://github.com/Axidify/Dashboarder/blob/main/docs/charts/PERFORMANCE.md).

## Bundle size (gzip)

| Package | Size | Budget | Pass |
|---------|------|--------|------|
| @axicharts/charts | 5.4 KB | 13.7 KB | ✅ |
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

## Update latency p95 (ms)

| Fixture | Scenario | p95 | Budget | Pass |
|---------|----------|-----|--------|------|
| small | 500 pts × 1 series | 0.01 | 8 | ✅ |
| medium | 5000 pts × 1 series | 0.04 | 16 | ✅ |
| dashboard-6up | 6 panels × 2000 pts | 0.11 | 16 | ✅ |
| large | 10000 pts × 1 series | 0.04 | 16 | ✅ |
| multi-series | 10000 pts × 4 series | 0.24 | 16 | ✅ |

## Fixtures

| File | Points | Series | Purpose |
|------|--------|--------|---------|
| `small.json` | 500 | 1 | SVG-scale update path |
| `medium.json` | 5,000 | 1 | Mid-size live panel |
| `large.json` | 10,000 | 1 | Canvas-scale path |
| `multi-series.json` | 10,000 | 4 | Multi-series canvas |
| `dashboard-6up.json` | 6 × 2,000 | 1 | Multi-panel frame budget |

> **Note:** These numbers measure uPlot `setData` in happy-dom with `@napi-rs/canvas`. They gate CI regressions; browser Playwright benches (4× CPU throttle) are planned for competitive comparisons vs Recharts/ECharts.
