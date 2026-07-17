# AxiCharts

**Operational dashboard runtime** — turn live data into monitoring screens. Spec-driven layouts, industrial-ready charts, embeddable in any React app.

- **GitHub:** https://github.com/Axidify/axicharts
- **Status:** Early implementation — RFC-001 `ChartContainer` landed

## Packages

| Package | Description |
|---------|-------------|
| `@axicharts/charts` | Layer 1 React API (`ChartContainer`, charts) |
| `@axicharts/charts-theme` | `cleanTheme`, `liveTheme`, `industrialTheme` |
| `@axicharts/charts-core` | Pure layout/math (no React) |

## Develop

```bash
pnpm install
pnpm build
pnpm test
pnpm storybook   # http://localhost:6006
```

## Roadmap

1. `ChartContainer` + themes ✅ (in progress)
2. Live line charts (uPlot adapter)
3. Storybook — Rich Ops + Grid Cells mockups
4. Tag → spec rules + MQTT adapter
