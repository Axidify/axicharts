# @axicharts/charts-mcp

MCP server for **RFC-002 cartesian** panel authoring. Wraps `@axicharts/charts-spec` planner and validation APIs so external agents can compose `type: "cartesian"` + `marks[]` without repo context.

## Tools

| Tool | Purpose |
|------|---------|
| `create_cartesian_panel` | Intent + fields → `PanelSpec` |
| `validate_cartesian_spec` | Spec + rows → `{ ok, spec?, errors[] }` |
| `revise_cartesian_panel` | Multi-turn revise (add rule/band/line) |
| `list_cartesian_marks` | Closed v1 mark catalog |
| `describe_data_profile` | Field names + inferred roles |
| `compile_cartesian_panel` | Validate + compile smoke test |

All cartesian tools reference schema: `@axicharts/charts-spec/schema/cartesian-panel.schema.json`. `describe_data_profile` uses `@axicharts/charts-spec/schema/data-profile.schema.json`.

## Cursor / Claude Desktop

```json
{
  "mcpServers": {
    "axicharts-cartesian": {
      "command": "npx",
      "args": ["-y", "@axicharts/charts-mcp"]
    }
  }
}
```

See [examples/cursor-mcp.json](./examples/cursor-mcp.json).

## Local dev (monorepo)

```bash
pnpm --filter @axicharts/charts-mcp build
node packages/charts-mcp/dist/cli.js
```

Or from repo root after build:

```json
{
  "mcpServers": {
    "axicharts-cartesian": {
      "command": "node",
      "args": ["/absolute/path/to/axicharts/packages/charts-mcp/dist/cli.js"]
    }
  }
}
```

## OpenAPI tool bundle

For non-MCP agents (LangChain, Vercel AI SDK):

```ts
import { OPENAPI_TOOL_BUNDLE } from "@axicharts/charts-mcp/openapi";
```

## Agent skill

See [agent-skills/cartesian/SKILL.md](./agent-skills/cartesian/SKILL.md) — when to use marks, retry loop, MCP workflow.

## Typical agent loop

1. `describe_data_profile` — learn field names and roles  
2. `create_cartesian_panel` — draft spec from intent (must name bar/line/area)  
3. `validate_cartesian_spec` — check against sample rows; retry on `UNKNOWN_FIELD`  
4. `revise_cartesian_panel` — follow-up (“add quota at 50”)  
5. `compile_cartesian_panel` — smoke before handoff  

## Related packages

- `@axicharts/charts-spec` — validation, compile, playground  
- `@axicharts/charts-planner` — full dashboard planning (uses cartesian marks after C139)
