# Release v0.4.18 — C170–C172 planner polish + hybrid layout

## Added

- **C170** — Panel budget (`PANEL_BUDGET`) in `planDashboardFromRows`; ordered ledger dimensions
- **C171** — Mosaic-style grid on `PanelsDashboard` (`columns`, `gap`)
- **C172** — `layout: "hybrid"` — static tabular panels + live MQTT mosaic wall

## Axiboard app (monorepo)

- **C170** — Sign-out control in header when auth is enabled

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.16 | **0.4.18** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.18`) |
