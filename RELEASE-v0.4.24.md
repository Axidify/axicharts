# Release v0.4.24 — RFC-004 agent grammar (C180 + distribution family)

## Added

- **C180** — `resolvePanelFamily`, `validatePanel`, `createPanel`, `listMarks` orchestrator in `charts-spec`
- **C181–C185** — Distribution family: `arc`, `funnel`, `donut`, `cell`, `label` marks; validate, normalize, compile, eject, simulation
- **charts-mcp** — Tier-0 `create_panel`, `validate_panel`, `list_marks` (cartesian aliases retained)
- **charts-spec** — Tabular stage funnel → `type: "distribution"` + `funnel` mark; `TIER2_PANEL` for waterfall/legacy charts
- **charts-runtime** — `agentValidated` on Axiboard tabular `PanelsDashboard` paths
- **axiboard** — Profile planner behind `VITE_ENABLE_PROFILE_PLANNER` (off by default)

## Fixed

- **charts-spec** — `ValidationIssue.fix` on cartesian `UNKNOWN_FIELD`
- **charts-spec** — `Chart` validates cartesian + distribution before compile

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.23 | **0.4.24** |
| `@axicharts/charts-mcp` | 0.1.2 | **0.1.3** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.24`) |

Triggered by GitHub release `v0.4.24` → [publish workflow](.github/workflows/publish.yml).
