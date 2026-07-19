# Release v0.4.19 — Tabular agent compose + compact bar chart fix

## Added

- **C173–C175** — Generic tabular analytics path (`suggestAnalyticsFromProfile` → `planDashboardFromRows`)
- **C176** — Agent compose detectors: project tasks, support cases, device telemetry, incidents
- **C177** — `composeLayout` for KPI + chart grid + pinned table layouts
- **C180** — `extractTabularFromMessage` for markdown tables in chat
- **charts-runtime** — `KpiFlipCard` for agent rationale on KPI panels
- **render-sandbox** — `pnpm render-sandbox` → http://localhost:3010 (compact layout visual harness)

## Fixed

- **charts-canvas** — Compact categorical bar charts: centered bars, wider bands, label ellipsis (IoT dashboard regression)
- **charts-spec** — KPI recipe overwrite guard; skip full-cardinality ID dimensions in generic analytics

## Axiboard app (monorepo)

- **C179** — Chat-first shell with sample starters and split-pane dashboard
- **C181** — Orchestrator refinement + golden tests for compose paths

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.18 | **0.4.19** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.19`) |

Triggered by GitHub release `v0.4.19` → [publish workflow](.github/workflows/publish.yml).
