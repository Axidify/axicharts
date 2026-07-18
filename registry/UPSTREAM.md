# Upstream shadcn/ui registry PR — checklist

> **Status:** Submitted (GTM-5). PR: https://github.com/shadcn-ui/ui/pull/11215

## Goal

Contribute AxiCharts chart blocks to the official [shadcn/ui registry index](https://ui.shadcn.com/r/registries.json) or a documented third-party slot, so users can run:

```bash
npx shadcn@latest add @axicharts/chart-axi-bar
```

without a custom `registries` entry in `components.json`.

## Prerequisites

- [x] **Custom registry stable** — 6 items validate (`pnpm test:registry` green on axicharts **v0.3.17+**)
- [x] **Hosted catalog** — `https://axidify.github.io/axicharts/registry/registry.json` returns valid JSON after docs deploy
- [ ] **npm packages published** — `@axicharts/charts` and `@axicharts/charts-theme` at the version pinned in registry item `dependencies`
- [x] **License** — MIT, compatible with shadcn/ui ecosystem
- [x] **No duplicate upstream chart blocks** — confirm shadcn Charts / Recharts blocks are the comparison target, not duplicates
- [x] **Peer deps documented** — `react`, `react-dom`, `echarts`, `uplot`, `tokens.css` / `--chart-*` CSS vars

## Registry item requirements

Per [registry-item.json schema](https://ui.shadcn.com/docs/registry/registry-item-json):

| Field | AxiCharts convention |
|-------|----------------------|
| `type` | `registry:block` for chart components; `registry:lib` for `chart-axi-chart-config` |
| `files[].path` | Relative to consumer `components/` or `lib/` aliases |
| `dependencies` | `@axicharts/charts@<semver>`, `@axicharts/charts-theme@<semver>` |
| `docs` | Peer install + gallery link (see `scripts/build-registry.mjs` `PEER_DOCS`) |
| `categories` | `charts`, `dashboard` |

## PR targets (pick one when ready)

1. **Registry index PR** — [shadcn-ui/ui](https://github.com/shadcn-ui/ui) `apps/v4/registry` or registries index JSON  
   - Add namespace entry pointing at `https://axidify.github.io/axicharts/registry/{name}.json`
2. **Docs cross-link** — shadcn “community registries” / charts migration doc mentioning AxiCharts custom registry

## Submission package

- [x] Short PR description: MIT React charts, `ChartContainer` + `chartConfig`, live uPlot path
- [x] Link: migration gallery `https://axidify.github.io/axicharts/shadcn`
- [x] Link: compare demo `https://axidify.github.io/axicharts/compare`
- [x] Link: install guide `https://axidify.github.io/axicharts/shadcn/registry`
- [ ] Screenshot or Storybook capture from **Charts/ShadcnParity**
- [x] Confirm items pass `npx shadcn registry validate -c registry registry.json` in axicharts repo

## Out of scope for upstream PR

- Paid template marketplace listings
- Full `@axicharts/charts-spec` / planner / embed runtime in registry
- ECharts specialty types beyond thin registry wrappers (donut is OK as block)

## References

- Custom registry source: `registry/` in axicharts monorepo
- Build: `node scripts/build-registry.mjs`
- E2E: `pnpm test:registry`
- Launch copy: `packages/charts-spec/examples/shadcn-registry/LAUNCH.md`
