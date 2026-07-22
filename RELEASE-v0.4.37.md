# Release v0.4.37 — CJS tabular + echarts peer + envelope freeze

## Added

- **charts-planner** — `@axicharts/charts-planner/tabular` CJS (`tabular.cjs`) for Nest/CJS static imports
- **docs** — RFC-005 agent chat envelope freeze; Project Desk reply (`docs/integrations/project-desk-v0.4.37-reply.md`)

## Changed

- **charts-echarts** — `peerDependencies` on `@axicharts/charts-spec@^0.4.37`
- **charts-planner** — tabular pie/donut intent (shipped on main since 0.4.36 publish)

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.36 | **0.4.37** |
| `@axicharts/charts-echarts` | 0.4.15 | **0.4.16** (peer `^0.4.37`) |
| `@axicharts/charts-planner` | 0.2.4 | **0.2.5** (peer `^0.4.37`) |

Triggered by GitHub release `v0.4.37` → [publish workflow](.github/workflows/publish.yml).
