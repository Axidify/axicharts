# Release v0.4.3 — C147a/C147b dynamic dashboard bugs

## Fixed

- **C147a** — Empty-safe first paint: cartesian panels with no rows render a loading shell instead of throwing `EMPTY_DATA`; static sources seed synchronously in `useDataSource`; dashboard snapshot merge preserves seed rows
- **C147b** — Planner X field inference: `planPanelFromMetric` uses profile fields (`week`, `date`, etc.) instead of hardcoded `"time"`

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ core siblings) | 0.4.2 | **0.4.3** |

## Issues

- Closes [#4](https://github.com/Axidify/axicharts/issues/4) (C147a)
- Closes [#5](https://github.com/Axidify/axicharts/issues/5) (C147b)
