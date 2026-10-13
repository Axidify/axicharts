# Release v0.5.0 — Narrow & stabilize

The pre-0.5 pass: plugin panel types become opt-in, cartesian `marks[]` becomes the single annotation surface, the less common chart types get a rendering overhaul, and themes / charts gain a real customization surface. Full detail in the [CHANGELOG](../../CHANGELOG.md#050---2026-10-13).

## Breaking

- **charts-spec** — plugin panel types (`sankey`, `geo`, `map`, `gantt`, `tank`, `andon`) are **opt-in**. `@axicharts/charts-spec` no longer depends on the plugin packages. Install the plugin and register it once:

  ```ts
  import "@axicharts/charts-sankey/register"; // one plugin
  import "@axicharts/charts-spec/plugins";    // or every first-party plugin
  ```

  `@axicharts/charts-full` still registers every plugin. Panel JSON is unchanged.
- **charts-spec** — `registerPluginChartTypes` moved to `@axicharts/charts-spec/plugins`; `resolveMapDrillProps` removed.
- **charts** — `<YAxis tickFormat="currency">` now formats values (`$1,234`) instead of appending `" USD"` to tooltip values.

## Highlights

- **Annotations** — `text` and `marker` overlay marks; legacy `annotations` / `referenceLines` / `thresholdBands` convert losslessly and warn (`LEGACY_OVERLAY_PROPS`, removal planned for 0.6).
- **Customization** — `valueFormat` (built-in id, registered id or function), `yDomain`, `yTickCount`; composable `<Tooltip>` / `<Legend>` props; `ChartTheme.font` typography; `ChartTheme.surface` for dark forks.
- **Rendering fixes** — violin, ridgeline and theme river draw again; threshold bands draw on uPlot charts; untoned ECharts series use the palette instead of one blue; treemap / sunburst labels readable; calendar and waterfall polish.
- **CI** — `pnpm typecheck` is gated; ~90 type errors fixed.

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings: core, theme, spec, runtime, full) | 0.4.39 | **0.5.0** |
| `@axicharts/charts-canvas` | 0.4.39 | **0.5.0** |
| `@axicharts/charts-echarts` | 0.4.18 | **0.5.0** (peer `^0.5.0`) |
| `@axicharts/charts-planner` | 0.2.6 | **0.3.0** (peer `^0.5.0`) |
| `@axicharts/charts-mcp` | 0.1.5 | **0.2.0** |
| `@axicharts/charts-map` | 0.4.7 | **0.5.0** |
| `@axicharts/charts-sankey`, `-geo`, `-gantt` | 0.1.1 | **0.2.0** |
| `@axicharts/charts-tank`, `-andon` | 0.1.0 | **0.2.0** |

Plugins peer `@axicharts/charts` at the exact platform version, so every plugin is republished alongside 0.5.0.

Triggered by GitHub release `v0.5.0` → [publish workflow](../../.github/workflows/publish.yml).
