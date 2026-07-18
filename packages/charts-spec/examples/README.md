# Panel spec examples

Runnable fixtures for `compilePanel`, `ejectPanel`, and the CLI.

## Granular styling (C68–C74)

| File | shadcn / Recharts parity |
|------|--------------------------|
| [revenue-line.panel.json](./revenue-line.panel.json) | Basic area line — `encoding.x` / `encoding.y` |
| [revenue-line-chartconfig.panel.json](./revenue-line-chartconfig.panel.json) | **chartConfig** labels/colors on `ChartContainer` |
| [throughput-bar-color.panel.json](./throughput-bar-color.panel.json) | **Colored bars** — `encoding.color`, `props.style`, chrome variants |
| [throughput-bar-size.panel.json](./throughput-bar-size.panel.json) | **Variable bar width** — `encoding.size` by volume field |
| [latency-line-size.panel.json](./latency-line-size.panel.json) | **Variable point radius** — `encoding.size` on line marks |
| [area-slo-line.panel.json](./area-slo-line.panel.json) | **Segmented area** — per-point `encoding.color` on area marks |

## shadcn port recipes (GTM-2)

| File | shadcn / Recharts parity |
|------|--------------------------|
| [browser-share-donut.panel.json](./browser-share-donut.panel.json) | **Donut** — `type: donut`, `innerRadius`, row-driven slices |
| [velocity-stacked-bar.panel.json](./velocity-stacked-bar.panel.json) | **Stacked bar** — `stacked: true`, multi-series `props.series` |
| [burndown-multi-line.panel.json](./burndown-multi-line.panel.json) | **Multi-series line** — burndown ideal vs remaining |

Registry prep (future shadcn/ui submission): [shadcn-registry/](./shadcn-registry/).

## CLI

```bash
# Compile to stdout (requires app harness) or eject Layer 1 JSX
npx @axicharts/charts-spec eject examples/throughput-bar-color.panel.json

# Plan from profile + intent
npx @axicharts/charts-spec plan profile.json --intent "throughput color by above target"
```

## Eject output

Panels with `encoding.color` eject to composable `<Bar><Cell fill /></Bar>` (or Line/Area) with a `resolveColorFill` helper — same renderer path as `compilePanel`.

Panels with `encoding.size` eject to `<Cell size={…} />` or `<Cell radius={…} />` with a `resolveSizeMark` helper and min/max preamble for quantitative fields.

`props.style.line.curve` ejects to `type="monotone"` or `type="linear"` on composable `<Line>` / `<Area>` (or `curve` on `LineChart` when not using Cell marks).

Panels with `props.style` eject to `createTheme(cleanTheme, { … })`. Chrome variants eject as `legendVariant` / `tooltipVariant` on `ChartContainer`.

Donut panels eject to `<PieChart innerRadius={…} />`. Stacked cartesian panels eject with `stacked` on the chart component.

## shadcn Charts port map

| shadcn / Recharts pattern | AxiCharts spec | AxiCharts JSX |
|---------------------------|----------------|---------------|
| `<Bar><Cell fill /></Bar>` | `encoding.color` | `<Bar><Cell dataKey fill /></Bar>` |
| Variable bar width / dot size | `encoding.size` | `<Bar><Cell dataKey size /></Bar>` |
| `chartConfig` labels/colors | `chartConfig` on container | `ChartContainer config={…}` |
| Donut / pie with hole | `type: donut`, `innerRadius` | `<PieChart innerRadius={…} />` |
| Stacked bar | `stacked: true` + `props.series` | `<BarChart stacked series={…} />` |
| Multi-series line | `props.series` | `<LineChart series={…} />` |
| Theme tokens | `props.style` | `createTheme(base, overrides)` |
| Tooltip / legend chrome | `props.tooltipVariant` / `legendVariant` | `ChartContainer` props |

Storybook: **Charts/ShadcnParity**, **Compare/Recharts vs AxiCharts**. Docs: `/shadcn`, `/templates/community` (GTM-2).
