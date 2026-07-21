# Release v0.4.25 — RFC-004 matrix family + agent families MCP guide

## Added

- **C186–C188** — Matrix family: `cell`, `colorScale`, `axis` marks; validate, normalize, compile, `createMatrixPanel`
- **charts-spec** — `type: "matrix"` panel grammar; legacy `heatmap` normalizes to matrix + `marks[]`
- **charts-spec** — Tabular heatmap intent → `geometry:matrix-heatmap` → validated matrix panels
- **charts-mcp** — `create_panel` / `list_marks` / `validate_panel` dispatch `family: "matrix"`
- **docs** — `/guides/agent-families` — 5-minute MCP loop (cartesian · distribution · matrix)
- **charts-mcp** — `agent-skills/families/SKILL.md` unified family workflow

## Fixed

- **charts-spec** — `Chart` validates matrix family before compile
- **charts-spec** — `HeatmapMatrix` type local to `heatmapEncoding` (no `charts-echarts` DTS dependency)

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.24 | **0.4.25** |
| `@axicharts/charts-mcp` | 0.1.3 | **0.1.4** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.25`) |

Triggered by GitHub release `v0.4.25` → [publish workflow](.github/workflows/publish.yml).
