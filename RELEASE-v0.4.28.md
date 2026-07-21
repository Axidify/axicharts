# Release v0.4.28 — Intent field binding + donut center alignment

## Fixed

- **charts-spec** — `createCartesianPanel` binds fields named in the intent before revenue/target vocabulary; unresolved `of <field>` sets `needsReview: "unresolved_field"` instead of silently plotting revenue
- **charts-spec** — `"target line at N"` parses as a rule overlay; plotted series keeps the intent-named metric (e.g. revenue)
- **charts-echarts** — Donut hole KPI centered with CSS overlay (`translate(-50%, -50%)` at pie center) — fixes right-shifted graphic/title text

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.27 | **0.4.28** |
| `@axicharts/charts-echarts` | 0.4.8 | **0.4.9** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.28`) |

Triggered by GitHub release `v0.4.28` → [publish workflow](.github/workflows/publish.yml).
