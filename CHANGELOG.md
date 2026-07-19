# Changelog

All notable changes to published `@axicharts/*` packages are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Older release detail may also appear in [GitHub Releases](https://github.com/Axidify/axicharts/releases) and one-off `RELEASE-v*.md` notes in this repo.

## [Unreleased]

### Added

- (nothing yet)

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
