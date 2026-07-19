# Release v0.4.4 — Planner/spec lockstep + create-dashboard CLI

## Fixed

- **C147d (partial)** — `create-dashboard` bin invokes CLI explicitly (fixes npx silent no-op); `.` target resolves to cwd; prints created file list
- **Planner/spec split** — `@axicharts/charts-planner@0.2.1` peers `@axicharts/charts-spec@^0.4.3` instead of bundling spec `0.3.52`

## Changed

- `pnpm check:versions` enforces planner peer includes platform minor; charts-spec matches platform version
- Troubleshooting docs: planner + spec version matrix

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ core siblings) | 0.4.3 | **0.4.4** |
| `@axicharts/charts-planner` | 0.2.0 | **0.2.1** |

## Adoption note

With planner `0.2.1` + spec `0.4.3+`, `planFromIntent` with `fields: ["week", …]` emits `encoding.x.field: "week"` — apps can drop x-field aliasing workarounds.
