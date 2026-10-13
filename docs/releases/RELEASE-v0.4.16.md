# Release v0.4.16 — C167 single tabular path

## Added

- **C167** — Panels spec `decisions` field validated and round-tripped in `charts-runtime`

## Fixed

- **charts-spec** — `tsconfig.json` `noEmit: true` — stops TS5055 overwrite when `dist/` exists

## Axiboard app (monorepo)

Shipped in the same tag — not published to npm:

- **C167** — `TabularUploadView` — unified upload; orchestrator-only planning (`autoPlan`)
- **C167** — Removed `/api/rnd/:slug` and legacy `src/rnd/*` interpreters
- **C167** — `DecisionLog` on upload + `TabularDashboardView`; decisions persisted on panels spec
- **C167** — Workspace is the only tabular persistence layer

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.15 | **0.4.16** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.16`) |
| `@axicharts/charts-mcp` | 0.1.2 | **0.1.2** (unchanged) |
