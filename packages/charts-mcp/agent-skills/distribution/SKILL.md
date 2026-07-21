---
name: axicharts-distribution-mcp
description: >-
  Use when authoring part-to-whole dashboard panels (pie, donut, share breakdown)
  via MCP tools from @axicharts/charts-mcp. Covers create, validate, and compile
  type distribution + marks[] specs.
---

# AxiCharts distribution MCP

Use the **@axicharts/charts-mcp** server when building pie/donut / share-breakdown charts.

## MCP tools

| Tool | When |
|------|------|
| `describe_data_profile` | First — learn field names and roles |
| `create_panel` | Draft spec — `{ family: "distribution", intent }` |
| `validate_panel` | Always before render — apply `fix` on `UNKNOWN_FIELD` |
| `list_marks` | Discovery — `{ family: "distribution" }` closed catalog |

Schema: `@axicharts/charts-spec/schema/distribution-panel.schema.json`

## Workflow

1. Call `describe_data_profile` with sample rows.
2. Call `create_panel` with `{ family: "distribution", intent }` — intent should mention pie, donut, share, or breakdown.
3. If `needsReview` is true, refine intent — do not ship chrome-only specs.
4. Call `validate_panel` with spec + rows.
5. On `UNKNOWN_FIELD`, apply `fix` or use `suggestion`.
6. On `MISSING_DATA_MARK`, ensure at least one `arc` or `funnel` mark is present.
7. Do **not** use `type: "pie"` or `type: "donut"` — use `type: "distribution"` + `marks[]`.

## Mark catalog (v1)

| Mark | Role | Required props |
|------|------|----------------|
| `arc` | Data — slice angle | `field` (quantitative) |
| `funnel` | Data — funnel stage value | `field` (quantitative), `sort` (optional) |
| `donut` | Chrome — hole | `innerRadius` (optional, default 42) |
| `cell` | Per-slice style | `dataKey` (category value) |
| `label` | Chrome — slice labels | `show` (optional) |

Encoding:

- `encoding.angle.field` — quantitative value per slice
- `encoding.color.field` — nominal category (slice name)

## Few-shot intents

| Intent | Expected marks |
|--------|----------------|
| Browser share breakdown donut | arc, donut, label |
| Status distribution pie | arc, label |
| Revenue share with Enterprise highlighted | arc, donut, cell, label |
| Pipeline funnel by stage | funnel, label |

## Never emit

- `type: "pie"` / `type: "donut"` / `type: "funnel"` — normalize to `type: "distribution"` + marks[]
- Unknown marks (`leader`, `wedge`) — not in v1 catalog
- Imperative `slices={...}` — use marks + encoding

Full guide: `packages/charts-spec/agent-skills/distribution/SKILL.md`.
