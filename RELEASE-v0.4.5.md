# Release v0.4.5 — C147d version matrix complete

## Added

- **C147d** — [Version matrix guide](https://axidify.github.io/axicharts/guides/versions): supported combos for Path 1/2, charts-full, runtime, planner

## Changed

- `pnpm check:versions` — lockstep now includes charts-spec, charts-runtime, charts-full (6 platform packages)
- `create-dashboard` scaffolds pin `^<platform>` instead of `latest`; README links version matrix

## Fixed

- Completes C147d exit criteria (CLI was fixed in v0.4.4)

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.4 | **0.4.5** |

Closes [#7](https://github.com/Axidify/axicharts/issues/7).
