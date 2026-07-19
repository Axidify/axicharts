import { createTablePanel, type PanelSpec } from "@axicharts/charts-spec";
import type { LedgerEnrichment } from "./ledgerEnrich";

export type LedgerChartAction = {
  kind: "chart";
  step: string;
  intent: string;
  rows: Record<string, string | number>[];
  xField: string;
  yField?: string;
  yFields?: string[];
  title: string;
};

export type LedgerTableAction = {
  kind: "table";
  step: string;
  intent: string;
  panel: PanelSpec;
  rows: Record<string, string | number>[];
};

export type LedgerWaterfallAction = {
  kind: "waterfall";
  step: string;
  intent: string;
  panel: PanelSpec;
  rows: Array<Record<string, string | number | boolean>>;
};

export type LedgerFollowUpAction =
  | LedgerChartAction
  | LedgerTableAction
  | LedgerWaterfallAction;

function matches(intent: string, pattern: RegExp): boolean {
  return pattern.test(intent.toLowerCase());
}

/** C148d — ledger rule-pack interpreter for agent follow-ups (replaces ad-hoc regex). */
export function interpretLedgerFollowUp(
  intent: string,
  enriched: LedgerEnrichment,
): LedgerFollowUpAction[] {
  const actions: LedgerFollowUpAction[] = [];
  const { fields } = enriched;

  if (matches(intent, /payment\s*method|pay\s*method/)) {
    actions.push({
      kind: "chart",
      step: "Chart — payment method (follow-up)",
      intent: "payment method volume bar chart with value labels",
      rows: enriched.volumeByPaymentMethod,
      xField: fields.paymentMethod,
      yField: "volume",
      title: "Volume by payment method",
    });
  }

  if (matches(intent, /transaction\s*table|show\s*transactions|ledger\s*table|all\s*rows/)) {
    actions.push({
      kind: "table",
      step: "Table — transactions (follow-up)",
      intent,
      panel: createTablePanel({
        title: "Transactions",
        columns: [
          { key: fields.date, label: "Date" },
          { key: fields.category, label: "Category" },
          { key: fields.debit, label: "Debit", align: "right" },
          { key: fields.credit, label: "Credit", align: "right" },
          { key: fields.paymentMethod, label: "Payment method" },
        ],
      }),
      rows: enriched.rows,
    });
  }

  if (matches(intent, /waterfall|bridge|variance|walk/)) {
    const items = enriched.waterfallByCategory.map((item) => ({
      name: item.name,
      value: item.value,
      ...(item.isTotal ? { isTotal: true } : {}),
      ...(item.tone ? { tone: item.tone } : {}),
    }));
    actions.push({
      kind: "waterfall",
      step: "Chart — category waterfall (follow-up)",
      intent: "ledger category waterfall bridge variance",
      panel: {
        specVersion: 1,
        type: "waterfall",
        title: "Net flow by category",
        theme: "clean",
        mode: "interactive",
        props: {
          items,
          valueFormat: "currency",
          currency: "MYR",
        },
      },
      rows: enriched.waterfallByCategory,
    });
  }

  if (
    matches(intent, /debit.*credit|credit.*debit|stacked/) &&
    !actions.some((action) => action.kind === "chart" && /stack/i.test(action.intent))
  ) {
    actions.push({
      kind: "chart",
      step: "Chart — debit vs credit stacked (follow-up)",
      intent: "stacked debit and credit bar chart by category with value labels",
      rows: enriched.expensesByCategory.map((row) => ({
        ...row,
        credit:
          enriched.revenueByCategory.find(
            (revenue) => revenue[fields.category] === row[fields.category],
          )?.credit ?? 0,
      })),
      xField: fields.category,
      yFields: ["debit", "credit"],
      title: "Debit vs credit by category",
    });
  }

  return actions;
}
