# Release v0.4.26 — RFC-004 grammar hygiene (cartesian routing + matrix simulation)

## Added

- **charts-spec** — Matrix simulation suite (`runMatrixSimulations`, M01–M08) with `silent_bad === 0` gate
- **charts-spec** — `compilePanel` regression tests for legacy cartesian routing

## Fixed

- **charts-spec** — `line` / `area` / `bar` / `combo` with row encoding → `normalizeToCartesian` + cartesian validate/compile; props-only legacy path unchanged
- **charts-spec** — `validatePanel` fix-patch tests for distribution and matrix `UNKNOWN_FIELD`

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.25 | **0.4.26** |
| `@axicharts/charts-mcp` | 0.1.4 | **0.1.4** (unchanged) |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.26`) |

Triggered by GitHub release `v0.4.26` → [publish workflow](.github/workflows/publish.yml).
