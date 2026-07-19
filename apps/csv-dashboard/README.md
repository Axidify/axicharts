# CSV dashboard example (C147c)

Minimal Vite app demonstrating **Path 2: CSV → profile → planFromIntent → Chart**.

```bash
# from axicharts repo root
pnpm install
pnpm csv-dashboard   # http://localhost:3002
```

## Flow

1. `parseCsv` — read uploaded file or bundled sample
2. `profileFromRows` — numeric columns → metrics, all columns → `fields`
3. `planFromIntent(profile, "Static CSV snapshot batch report")` — panel specs
4. `<Chart panel={…} data={{ rows }} />` per panel

## Packages (minimal)

- `@axicharts/charts-planner` + `@axicharts/charts-spec` (peer) + `@axicharts/charts` + `uplot`

See [CSV dashboard guide](https://axidify.github.io/axicharts/guides/csv-dashboard) for copy-paste snippets and bundle notes.
