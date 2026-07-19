# Release v0.3.52 — RFC-002 cartesian agent loop

Branch: `feat/rfc-002-c136-cartesian`

## Highlights

### C136–C137 — Cartesian building blocks
- `type: "cartesian"` panel spec with `marks[]`
- `validateCartesianSpec` with structured error codes and field suggestions
- `CartesianChart` composable shell + composable eject
- Legacy `combo` / `line` / `bar` normalize with dev warnings

### C138 — Blocks Playground
- Live spec ↔ chart ↔ JSX eject in Storybook
- Preset recipes, validation footer, planner review signals

### C139 — Planner migration
- Finance / ops / trading rule packs emit `cartesian` + `marks[]` only
- `createCartesianPanel`, `reviseCartesianPanel`

### C140 — MCP distribution
- New `@axicharts/charts-mcp@0.1.0` stdio server
- Tools: `create_cartesian_panel`, `validate_cartesian_spec`, `revise_cartesian_panel`, `list_cartesian_marks`, `describe_data_profile`, `compile_cartesian_panel`
- OpenAPI bundle + agent skill

### Fixes & polish
- Gauge presentation overlap fix
- Pie chart palette cycling + gap-free segments
- Pictorial bar invalid tone crash
- **UPlotCombo stacked bar rendering** (marks `stack` id → live canvas)

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ core siblings) | 0.3.50 | **0.3.52** |
| `@axicharts/charts-planner` | 0.1.4 | **0.2.0** |
| `@axicharts/charts-mcp` | — | **0.1.0** (new) |

## Publish

```bash
cd axicharts
pnpm install
pnpm build
pnpm test
# Create GitHub release → triggers .github/workflows/publish.yml
```

## Remaining for v0.4.0

- Remove `combo` / `blocks` legacy panel types
- Export full JSON Schema set to `charts-spec`
- Expanded agent eval fixture suite
