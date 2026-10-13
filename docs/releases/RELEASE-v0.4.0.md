# Release v0.4.0 — Adoption track (C141–C146)

## Highlights

### C141 — Narrative collapse
- README/docs **Start here** / **Advanced** / **Architecture** structure
- Import cheat sheet, choosing-your-path guide

### C142 — Bundle trust
- Public gzip benchmark table, troubleshooting page, peer matrix

### C143 — Theming product
- Token glossary, theme playground (`/guides/theme`) with live preview and `createTheme` export

### C144 — Dashboard interaction
- `ChartPointerEvent`, `onCategoryClick` / `onSeriesClick` on LineChart and BarChart
- `categories` with `meta`; zero values still emit; keyboard Enter/Space
- Portfolio filter Storybook demo

### C145 — Agent cartesian onboarding
- Validate→retry→eject tutorial at `/guides/agent-cartesian`

### C146 — Versioning & polish
- `pnpm check:versions` CI gate for charts / core / theme lockstep
- Built with AxiCharts badge page (`/guides/branding`)
- Flat-zero series caption; experimental import warning in troubleshooting

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ core, theme, canvas, echarts, full, spec, runtime, map) | 0.3.52 | **0.4.0** |

## Publish

Triggered by GitHub release `v0.4.0` → [publish workflow](../../.github/workflows/publish.yml).
