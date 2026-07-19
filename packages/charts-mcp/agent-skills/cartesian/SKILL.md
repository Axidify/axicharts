---
name: axicharts-cartesian-mcp
description: >-
  Use when authoring cartesian dashboard panels via MCP tools from @axicharts/charts-mcp.
  Covers create, validate, revise, and compile type cartesian + marks[] specs.
---

# AxiCharts cartesian MCP

Use the **@axicharts/charts-mcp** server when building cartesian charts in Cursor or other MCP clients.

## MCP tools

| Tool | When |
|------|------|
| `describe_data_profile` | First — learn fields and roles from sample rows |
| `create_cartesian_panel` | Draft spec from intent (must name bar/line/area) |
| `validate_cartesian_spec` | Always before render — retry on errors |
| `revise_cartesian_panel` | Follow-up turns (“add SLO at 200”) |
| `list_cartesian_marks` | Discovery — closed v1 catalog only |
| `compile_cartesian_panel` | Smoke test compile path |

Schema: `@axicharts/charts-spec/schema/cartesian-panel.schema.json` · data profile: `@axicharts/charts-spec/schema/data-profile.schema.json`

## Workflow

1. Call `describe_data_profile` with sample rows.
2. Call `create_cartesian_panel` with explicit mark types in intent.
3. If `needsReview` is true, refine intent — do not ship empty or overlay-only specs.
4. Call `validate_cartesian_spec` with spec + rows.
5. On `UNKNOWN_FIELD`, use `suggestion` and retry validate.
6. On `MISSING_DATA_MARK`, refine intent with bar/line/area.
7. Optional: `revise_cartesian_panel` for incremental edits.
8. Optional: `compile_cartesian_panel` before handoff.

## Never emit

- `type: "combo"`, `type: "line"`, `type: "blocks"` — use `cartesian` + `marks[]` only.
- Unknown marks (`point`, `scatter`, `text`) — not in v1 catalog.
- Legacy `referenceLines` / `thresholdBands` — use `rule` / `band` marks.

## Few-shot intents

| Intent | Expected marks |
|--------|----------------|
| Weekly revenue bars with target line, quota at 50, healthy band 44-52 | bar, line, rule, band |
| p95 latency line with SLO at 200 and healthy band under 150 | line, rule, band |
| bar chart of weekly revenue with target line | bar, line |

Full mark guide: `@axicharts/charts-spec` agent skill at `packages/charts-spec/agent-skills/cartesian/SKILL.md`.
