# Release v0.4.32 — D-101 horizontal bar parity + Lane B visual CI

## Fixed

- **charts-canvas** — horizontal bar left gutter no longer double-counted (`padding.left` vs axis `size`); tighter category axis sizing + 3px label gap
- **charts-canvas** — horizontal value axis uses 15-step ticks @ dashboard tiles (matches Recharts reference)

## Added

- **storybook** — `Audit/Dashboard adjacent` Lane B visual CI story + snapshot (**D-301**)

## Changed

- **docs** — horizontal bar **D-101** → Parity; wall eight complete @ 360×280

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.31 | **0.4.32** |
| `@axicharts/charts-echarts` | 0.4.12 | **0.4.12** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.32`) |

Triggered by GitHub release `v0.4.32` → [publish workflow](.github/workflows/publish.yml).
