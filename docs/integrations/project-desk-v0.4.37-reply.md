# Project Desk — integration follow-up (v0.4.37)

**To:** Project Desk team  
**From:** AxiCharts / Axidify  
**Re:** Agent/chat server-first charts integration feedback

---

Thanks again for the detailed integration report — it directly shaped `0.4.36` and `0.4.37`.

## Shipped since your feedback

### Documentation & ergonomics (`0.4.36`)

- **Planner README** — server entry points (`./tabular`, `./server`), Nest/CJS patterns  
- **Agent chat integration guide** — [axidify.github.io/axicharts/guides/agent-chat-integration](https://axidify.github.io/axicharts/guides/agent-chat-integration)  
- **Version matrix** — tested combos (`spec` + `echarts` + `planner`)  
- **`toUserFacingHint()`** — chat-friendly validation fallbacks in `@axicharts/charts-spec`

### Packaging & planner (`0.4.37`)

- **`@axicharts/charts-planner/tabular` CJS** — static `require()` / import for Nest CJS builds (`tabular.cjs`, bundles `charts-spec/planning`)  
- **Tabular pie/donut intent** — `planDashboardFromRows(rows, { intent: "pie chart by …" })` emits `type: "distribution"` on the generic path  
- **`charts-echarts` peer** on `@axicharts/charts-spec` at platform minor (npm warns on skew)  
- **RFC-005** — envelope + panel spec freeze before 0.5: [docs/rfc/RFC-005-agent-chat-envelope-freeze.md](../rfc/RFC-005-agent-chat-envelope-freeze.md)

## Tested production line

```bash
pnpm add \
  @axicharts/charts-spec@^0.4.37 \
  @axicharts/charts@^0.4.37 \
  @axicharts/charts-theme@^0.4.37 \
  @axicharts/charts-echarts@^0.4.16 \
  @axicharts/charts-planner@^0.2.5 \
  uplot
```

## NestJS — updated pattern

```ts
// Static import works when API compiles to CJS (0.4.37+)
import { planDashboardFromRows } from "@axicharts/charts-planner/tabular";

// Or require()
const { planDashboardFromRows } = require("@axicharts/charts-planner/tabular");
```

Dynamic `import()` remains valid for older pins.

## Still on the 0.5 roadmap

- Orchestration-layer `chartStyle: bar | pie | donut` (families stay separate per RFC-004)  
- Optional `@axicharts/charts-planner-node` alias package (low priority — `/tabular` covers API use cases)  
- Expanded MCP docs vs custom adapters (your deferral stands)

## Attribution

We'd like to reference your architecture diagram (tool → adapter → envelope → lazy block) in the integration guide. Reply if that's OK and preferred attribution text.

Happy to pair on the Reports pilot when you're ready.

— AxiCharts team
