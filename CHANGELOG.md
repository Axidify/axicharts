# Changelog

All notable changes to published `@axicharts/*` packages are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Older release detail may also appear in [GitHub Releases](https://github.com/Axidify/axicharts/releases) and one-off `RELEASE-v*.md` notes in this repo.

## [Unreleased]

### Added

- **C147c** — [CSV → dashboard guide](https://axidify.github.io/axicharts/guides/csv-dashboard) (Path 2): parse → profile → `planFromIntent` → `Chart` panels; `apps/csv-dashboard` Vite example; linked from Choosing your path

## [0.4.4] - 2026-07-19

### Fixed

- `create-dashboard` CLI — bin calls `runCreateDashboardCli` explicitly (fixes npx silent no-op); `.` resolves to cwd; success prints file list
- Planner/spec version split — `@axicharts/charts-planner@0.2.1` peers `@axicharts/charts-spec@^0.4.3` (no nested spec `0.3.52`)

### Changed

- `pnpm check:versions` — planner peer must include platform minor; charts-spec version must match platform
- Troubleshooting docs — planner + spec version matrix

## [0.4.3] - 2026-07-19

### Fixed

- **C147a** — Empty-safe first paint for cartesian panels: loading shell via `ChartContainer` `dataState="loading"` instead of `EMPTY_DATA` throw; static `useDataSource` seeds on first render; `mergeDashboardData` preserves seed rows
- **C147b** — Planner infers `encoding.x.field` from data profile (`week`/`date`/…) via `inferCategoryFieldFromProfile`, not hardcoded `"time"`

## [0.4.2] - 2026-07-19

### Added

- Generic `ChartPointerEvent<TMeta>` and `ChartCategoryInput<TMeta>` for typed category `meta` (no cast in handlers)
- Start here docs: chart-as-filter snippet with typed imports; troubleshooting note on zero/flat-week click policy (app-owned)

## [0.4.1] - 2026-07-19

### Fixed

- Export `ChartPointerEvent` (and `ChartCategoryInput`, `ChartSeriesInput`, `buildChartPointerEvent`, `normalizeChartCategories`) from the main `@axicharts/charts` barrel — previously only via `/cartesian`

## [0.4.0] - 2026-07-19

Adoption track C141–C146 — see [RELEASE-v0.4.0.md](./RELEASE-v0.4.0.md) for full notes.

### Added

- **C144** — `ChartPointerEvent`, `onCategoryClick` / `onSeriesClick` on `LineChart` and `BarChart`; `categories` with `meta`; keyboard parity
- **C143** — Docs theme playground with token glossary and `createTheme` export snippet
- **C145** — Agent cartesian guide (`/guides/agent-cartesian`)
- **C146** — `pnpm check:versions` lockstep CI; Built with AxiCharts badge page; flat-zero series caption
- **C141–C142** — Docs front door (start here, benchmarks, troubleshooting, import cheat sheet)

### Changed

- Core chart packages **0.3.52 → 0.4.0**
- `@axicharts/charts-echarts` size budget **20 KB → 20.1 KB** (measured +85 B)

### Fixed

- `CategoryClickOverlay` DTS build (`nativeEvent` typed as DOM `Event`)
- Docs `typecheck` clean (PluginsPage `TankChart` import, demo duplicate props, `StatTone`)
- JSON Schema export: `cartesian-panel.schema.json` and `data-profile.schema.json` via `pnpm export:schemas`
- Storybook HMR: idempotent builtin dashboard template registration

## [0.3.52] - 2026-07-19

RFC-002 cartesian agent loop — see [RELEASE-v0.3.52.md](./RELEASE-v0.3.52.md) for full notes.

### Added

- `type: "cartesian"` panel spec with composable `marks[]` (C136–C137)
- `validateCartesianSpec` with structured error codes and field suggestions
- `CartesianChart` composable shell and composable eject path
- Blocks Playground in Storybook — live spec ↔ chart ↔ JSX eject (C138)
- Planner rule packs emit `cartesian` + `marks[]`; `createCartesianPanel`, `reviseCartesianPanel` (C139)
- `@axicharts/charts-mcp@0.1.0` — MCP tools for cartesian panel compose, validate, revise, compile (C140)
- UPlotCombo stacked bar rendering when marks share a `stack` id

### Changed

- `@axicharts/charts-planner` **0.2.0** — cartesian-only planner emits
- Core chart packages **0.3.50 → 0.3.52**

### Fixed

- Gauge presentation overlap on light surfaces
- Pie chart palette cycling and gap-free segment rendering
- Pictorial bar crash on invalid `SeriesTone`
- `showValues` typing on cartesian panel spec (`PanelSpec`)
