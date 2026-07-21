# @axicharts/charts-mcp

MCP server for **RFC-004 agent chart families** — cartesian, distribution, and matrix. Wraps `@axicharts/charts-spec` planner and validation APIs so external agents compose closed `marks[]` grammars without repo context.

## Tools (Tier 0)

| Tool | Purpose |
|------|---------|
| `create_panel` | Intent + family → `PanelSpec` (prefer over legacy per-family tools) |
| `validate_panel` | Spec + rows → `{ ok, spec?, errors[] }` with `fix` patches |
| `list_marks` | Closed mark catalog per family |
| `plan_dashboard` | Tabular CSV/rows → KPIs, charts, decisions, persona |
| `compose_panel` | `PanelRecipe` + rows → validated `PanelSpec` (C174) |
| `execute_transform` | `aggregateRows` — groupBy + aggregates + where |
| `list_transform_ops` | Closed transform algebra catalog |
| `describe_data_profile` | Field names + inferred roles |

## Tools (cartesian debug / compat)

| Tool | Purpose |
|------|---------|
| `create_cartesian_panel` | Intent + optional `rows`/`groupBy` pre-aggregate |
| `validate_cartesian_spec` | Cartesian-only validation |
| `revise_cartesian_panel` | Multi-turn revise (add rule/band/line) |
| `list_cartesian_marks` | Cartesian mark catalog |
| `compile_cartesian_panel` | Validate + compile smoke test |
| `create_table_panel` | Row preview / transaction table |

Schema URLs: `cartesian-panel.schema.json` · `data-profile.schema.json` on relevant tools.

## OpenAPI tool bundle (non-MCP agents)

```ts
import { OPENAPI_TOOL_BUNDLE } from "@axicharts/charts-mcp/openapi";
```

Published JSON (after build): `openapi/tools.bundle.json` in this package.

Docs: [Agent MCP schemas](https://axidify.github.io/axicharts/guides/agent-mcp-schemas)

## Cursor / Claude Desktop

**Published (npm):**

```json
{
  "mcpServers": {
    "axicharts": {
      "command": "npx",
      "args": ["-y", "@axicharts/charts-mcp"]
    }
  }
}
```

See [examples/cursor-mcp.json](./examples/cursor-mcp.json).

## Typical agent loop

1. `describe_data_profile` — learn field names and roles  
2. `plan_dashboard` — full tabular plan (preferred for CSV/chat tables)  
3. `create_panel` — single panel from intent (must name mark types for cartesian)  
4. `execute_transform` + `compose_panel` — when you need explicit aggregation recipes  
5. `validate_panel` — mandatory; retry on `UNKNOWN_FIELD` using `fix` patches  
6. `compile_cartesian_panel` — optional smoke before handoff  

For tabular CSV uploads, prefer `plan_dashboard` over hand-building panels.

## Agent skills

- [agent-skills/families](./agent-skills/families/SKILL.md) — 3-family overview  
- [agent-skills/cartesian](./agent-skills/cartesian/SKILL.md) — cartesian deep dive  
- [agent-skills/distribution](./agent-skills/distribution/SKILL.md)  
- [agent-skills/matrix](./agent-skills/matrix/SKILL.md)

## Related packages

- `@axicharts/charts-spec` — validation, compile, playground  
- `@axicharts/charts-planner` — tabular `planDashboardFromRows`
