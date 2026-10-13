# Release v0.4.6 — C147e RuntimeDashboard stability

## Fixed

- **C147e** — `RuntimeDashboard` / `DashboardEmbed` no longer infinite-re-render when `dashboard.data` is passed without `dataSource` (inline static spec deduped via `dataSourceSpecKey`)
- `useDataSource` / `useDataSources` reconnect only when serializable spec fields change (ignores `fetch` / `mapResponse` identity)

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts-runtime` (+ platform siblings) | 0.4.5 | **0.4.6** |

Closes [#6](https://github.com/Axidify/axicharts/issues/6).
