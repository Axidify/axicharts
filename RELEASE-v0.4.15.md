# Release v0.4.15 — C166 main workspace tabular

## Added

- **C166** — `layout: "panels"` on `RuntimeDashboardSpec` — tabular KPI + chart blocks with per-panel rows
- **C166** — `PanelsDashboard` component; validation for panels runtime spec
- **C166** — Vite monorepo alias helper + CI guard (`check:vite-aliases`) — fixes recurring Storybook/CI subpath resolution breaks

## Axiboard app (monorepo)

Shipped in the same tag — not published to npm:

- **C166** — **Apply to dashboard** from Upload CSV flow — orchestrator plan persists in workspace
- **C166** — `TabularDashboardView` — saved panels + orchestrator chat follow-ups on main workspace
- **C166** — Dashboard meta stores `sourceCsv`, persona, follow-up intents for replan

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.14 | **0.4.15** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (unchanged) |
| `@axicharts/charts-mcp` | 0.1.2 | **0.1.2** (unchanged) |
