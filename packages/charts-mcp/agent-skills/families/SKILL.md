---
name: axicharts-agent-families-mcp
description: >-
  Use when building agent-generated dashboards via @axicharts/charts-mcp.
  Covers cartesian, distribution, and matrix families — validate before render.
---

# AxiCharts agent families MCP

Use **@axicharts/charts-mcp** for all agent chart generation. Three closed grammars — one workflow.

## Tier-0 tools

| Tool | When |
|------|------|
| `describe_data_profile` | First — field keys, roles, sample values |
| `create_panel` | Draft spec — `{ family, intent, fields? }` |
| `validate_panel` | **Always** before render — apply `fix` patches on retry |
| `list_marks` | Discovery — `{ family }` closed catalog |
| `plan_dashboard` | Full tabular grid from rows |

## Families

| `family` | Marks | Use for |
|----------|-------|---------|
| `cartesian` | bar, line, area, rule, band | Trends, comparisons, SLO overlays |
| `distribution` | arc, funnel, donut, cell, label | Pie, donut, stage funnel |
| `matrix` | cell, colorScale, axis | Heatmap grids (hour×day, correlation) |

## 5-minute loop

1. `describe_data_profile({ rows })`
2. `create_panel({ family: "cartesian" \| "distribution" \| "matrix", intent, fields })`
3. If `needsReview` — refine intent; do not render vague specs
4. `validate_panel({ spec, rows })` — retry on errors; apply `fix` when present
5. Hand off spec to runtime `Chart` or `plan_dashboard`

## Never emit

- `type: "line"`, `"combo"`, `"blocks"`, `"pie"`, `"donut"`, `"heatmap"` — normalize to family + `marks[]`
- Raw `compilePanel` or ECharts option trees
- Tier-2 types (waterfall, gauge, geo) without flagging `needs_review`

## Schemas

- Cartesian: `@axicharts/charts-spec/schema/cartesian-panel.schema.json`
- Distribution: `@axicharts/charts-spec/schema/distribution-panel.schema.json`
- Matrix: `@axicharts/charts-spec/schema/matrix-panel.schema.json`

Per-family detail: `packages/charts-spec/agent-skills/{cartesian,distribution}/SKILL.md`
