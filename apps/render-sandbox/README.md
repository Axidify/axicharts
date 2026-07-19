# Render sandbox

Visual harness for axicharts chart rendering — especially compact dashboard layouts where uPlot bar spacing and label clipping show up.

## Run

```bash
pnpm render-sandbox
```

Open **http://localhost:3010**

Uses monorepo Vite aliases (`scripts/vite-monorepo-aliases.ts`) so edits to `packages/charts-canvas` hot-reload without rebuilding dist.

## Scenarios

| Scenario | What it catches |
|----------|-----------------|
| Two categories | Bars pinned to chart edges (sparse ordinal x-axis) |
| Four device IDs | Label clipping (`DEV004` → `DEV00`) in narrow tiles |
| Long category labels | Ellipsis vs hard clip |
| Twelve months | Bar density at higher cardinality |
| Single category | Centering edge case |
| IoT telemetry grid | Full 2×2 axiboard reproduction |
| Bar + line combo | Mixed marks in compact height |
| Dual-axis combo | Right y2 + overlay insets |
| Bar value labels | `showValues` top padding |
| Compact bar (60px) | Sparkline-height bars |
| KPI stat strip (72px) | PanelsDashboard KPI row |
| Table panel (320px) | Register at dashboard table height |

## Layout controls

- **Axiboard tile (~360px)** — single chart at dashboard card width
- **Axiboard 2-col grid** — 760px container, 2 columns, 280px charts (matches `PanelsDashboard`)
- Custom width / height / column count

## vs Storybook

Storybook (`pnpm storybook`) documents individual components with padded layouts. This sandbox focuses on **layout stress cases** that only appear in dashboard embeds — the same conditions that surfaced the IoT bar chart bugs.

## Adding scenarios

See `docs/render-audit.md` for the full issue tracker and GitHub [#9](https://github.com/Axidify/axicharts/issues/9).
