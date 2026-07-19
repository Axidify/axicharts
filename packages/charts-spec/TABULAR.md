# Tabular data → agent dashboards (C148)

Agent and planner APIs for **row-shaped business data** (CSV, API exports, ledgers).

**Product RFC:** [axiboard RFC-003](https://github.com/Axidify/axiboard/blob/main/docs/rfcs/RFC-003-tabular-agent-dashboard.md) (private planning repo)

## APIs (v0.4.7+ R&D)

| API | Purpose |
|-----|---------|
| `inferFieldRoles(rows)` | time / dimension / measure / identifier |
| `classifyTabularDomain(profile)` | data-driven vertical (sales, ledger, attendance, …) — C155 |
| `enrichProfileWithDomain(profile)` | tag metrics with inferred vertical when confident |
| `rankQuestions(...)` | persona-weighted question ranking (C156) |
| `findQuestionsForIntent(intent, vertical)` | NL follow-up → catalog questions |
| `questionToRecipe` / `compileRecipe` | question → geometry → PanelSpec (C158) |
| `fieldProfilesToDataProfile(profiles)` | metrics + fields for planner |
| `aggregateRows(rows, { groupBy, aggregates })` | chart-ready grouped rows |
| `createCartesianPanel({ yField, yFields, xField, intent })` | explicit field binding + stacked bars |
| `createTablePanel` | transaction / row preview table panel |
| `parseTabular(text)` | CSV / pipe / TSV → rows |
| `planFromCsv` (charts-planner) | text → `DashboardPlan` |
| `ledgerRulePack` | vertical rules for journal / GL data |
| `attendanceRulePack` | vertical rules for HR / timesheet data (C153) |
| `salesRulePack` | vertical rules for CRM / pipeline data (C154) |
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
