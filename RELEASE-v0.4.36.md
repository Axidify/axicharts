# Release v0.4.36 — Agent chat integration docs

## Added

- **charts-spec** — `toUserFacingHint()` / `toUserFacingHints()` for chat UI validation fallbacks
- **docs** — Agent chat integration guide (`/guides/agent-chat-integration`); version matrix tested compatibility table

## Changed

- **charts-planner** — README server vs browser entry points; Nest/CJS dynamic `import()` for `./tabular`
- **charts-echarts** — `peerDependencies` on `@axicharts/charts-spec` at platform minor

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.35 | **0.4.36** |
| `@axicharts/charts-canvas` | 0.4.35 | **0.4.36** |
| `@axicharts/charts-echarts` | 0.4.14 | **0.4.15** (peer `^0.4.36`) |
| `@axicharts/charts-planner` | 0.2.3 | **0.2.4** (peer `^0.4.36`) |

Triggered by GitHub release `v0.4.36` → [publish workflow](.github/workflows/publish.yml).
