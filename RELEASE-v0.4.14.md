# Release v0.4.14 — C161 + C165 tabular pipeline

## Added

- **C165** — `profileTabular(rows)` — L1 `grain`, `cardinalities`, `timeSpan` on `DataProfile`
- **C165** — `rankQuestions` cardinality penalty; `inferChartGeometry` horizontal bar for high-cardinality dimensions
- **C165** — Domain classification step in `planDashboardFromRows` decision log (C164)
- **C162** — `@axicharts/charts-spec/planning` and `@axicharts/charts-planner/tabular` server-safe entry points
- **C161** — Golden contract tests in `apps/axiboard` (MCP ≡ orchestrator; monorepo, not npm)

## Axiboard app (monorepo)

Shipped in the same tag — not published to npm:

- **C162** — Production server (`pnpm start`), Dockerfile, compose
- **C163** — `/api/workspaces` + `/api/rnd/:slug` persistence
- **C164** — Unified **Upload CSV** tabular R&D view

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.6 / 0.4.13 | **0.4.14** |
| `@axicharts/charts-planner` | 0.2.1 | **0.2.2** |
| `@axicharts/charts-mcp` | 0.1.1 | **0.1.2** |
