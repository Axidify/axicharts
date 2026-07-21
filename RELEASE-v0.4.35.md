# Release v0.4.35 — Agent 100% exit (Tracks A + B + C)

## Added

- **charts-spec** — `point` mark; `familyRegistry` / `registerChartFamily`; `composePanel`, `executeTransform`, `applyTransformPlans`; agent simulation summaries for integrator docs
- **charts-mcp** — `compose_panel`, `execute_transform`, `list_transform_ops`; OpenAPI tool bundle (14 tools)
- **charts-planner** — Tabular `planShell` (ESM-safe); grammar validation via `validatePanel`
- **axiboard** — M1 demo golden script; C181 follow-up recipes; C178 BYOK structured `transformPlans[]`
- **docs** — Agent cartesian guide, error gallery, MCP schemas, simulation table, eject walkthrough, playground presets

## Changed

- **charts-spec** — `DUPLICATE_OVERLAY_CHANNEL` strict error; ledger waterfall → cartesian bridge; profile planner off agent `/planning` entry
- **charts-runtime** — Strict `agentValidated` render gate

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.34 | **0.4.35** |
| `@axicharts/charts-canvas` | 0.4.32 | **0.4.35** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.3** (peer `^0.4.35`) |
| `@axicharts/charts-mcp` | 0.1.4 | **0.1.5** |

Triggered by GitHub release `v0.4.35` → [publish workflow](.github/workflows/publish.yml).
