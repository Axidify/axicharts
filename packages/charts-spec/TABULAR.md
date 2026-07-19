# Tabular data → agent dashboards (C148)

Agent and planner APIs for **row-shaped business data** (CSV, API exports, ledgers).

**Product RFC:** [axiboard RFC-003](https://github.com/Axidify/axiboard/blob/main/docs/rfcs/RFC-003-tabular-agent-dashboard.md) (private planning repo)

## APIs (v0.4.7+ R&D)

| API | Purpose |
|-----|---------|
| `inferFieldRoles(rows)` | time / dimension / measure / identifier |
| `fieldProfilesToDataProfile(profiles)` | metrics + fields for planner |
| `aggregateRows(rows, { groupBy, aggregates })` | chart-ready grouped rows |
| `createCartesianPanel({ yField, xField, intent })` | explicit field binding |
| `ledgerRulePack` | vertical rules for journal / GL data |
| `PanelSpecGrid` | render `PanelSpec[]` + `{ rows }` |

## Example

```ts
import {
  aggregateRows,
  createCartesianPanel,
  inferFieldRoles,
  validateCartesianSpec,
} from "@axicharts/charts-spec";

const roles = inferFieldRoles(rows);
const byMethod = aggregateRows(rows, {
  groupBy: "Payment Method",
  aggregates: {
    volume: { op: "sum", fields: ["Debit (RM)", "Credit (RM)"] },
  },
});

const { panel } = createCartesianPanel({
  intent: "payment method volume bar chart",
  fields: Object.keys(byMethod[0] ?? {}),
  xField: "Payment Method",
  yField: "volume",
});

validateCartesianSpec(panel, { rows: byMethod });
```

## Tests

- `src/tabular.test.ts`
- `src/createCartesianPanel.test.ts` (yField)

## Slices

See axiboard [C148 track](https://github.com/Axidify/axiboard/blob/main/docs/charts/issues/adoption-track-c148-c152.md).
