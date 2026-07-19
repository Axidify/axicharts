import type { PanelSpec } from "../types";
import type { VerticalPanelContext, VerticalRulePack } from "./types";

function applyLedgerPanelRules(panel: PanelSpec, ctx: VerticalPanelContext): PanelSpec {
  const name = ctx.metric.name.toLowerCase();
  const intent = ctx.intent?.toLowerCase() ?? "";
  const fields = ctx.profileFields ?? [];

  if (/kpi|stat|headline/.test(intent)) {
    return {
      ...panel,
      type: "stat",
      theme: "clean",
      mode: "interactive",
      encoding: { value: { field: ctx.metric.name, type: "quantitative" } },
      props: {
        label: ctx.metric.name,
        monospace: true,
      },
    };
  }

  if (/balance/.test(name) || /balance/.test(intent)) {
    const timeField =
      fields.find((f) => /date|time|period|week|month/i.test(f)) ?? "date";
    return {
      ...panel,
      type: "cartesian",
      title: panel.title ?? "Balance over time",
      theme: "clean",
      mode: "interactive",
      encoding: { x: { field: timeField, type: "temporal" } },
      marks: [
        {
          type: "line",
          field: ctx.metric.name,
          label: "Balance",
          curve: "monotone",
          tone: "info",
        },
      ],
    };
  }

  if (
    /debit|expense|spend/.test(name) ||
    /expense|debit|spend/.test(intent)
  ) {
    const dimField =
      fields.find((f) => /category|cost|center|payment|method|account/i.test(f)) ??
      fields.find((f) => !/debit|credit|balance|amount/i.test(f)) ??
      "category";
    return {
      ...panel,
      type: "cartesian",
      title: panel.title ?? "Expenses breakdown",
      theme: "clean",
      mode: "interactive",
      encoding: {
        x: { field: dimField, type: "nominal" },
        y: { field: "debit", type: "quantitative", format: "currency" },
      },
      marks: [
        {
          type: "bar",
          field: /debit/.test(name) ? ctx.metric.name : "debit",
          label: "Debit",
          tone: "warning",
          labels: true,
        },
      ],
    };
  }

  if (/credit|revenue/.test(name) || /revenue|credit|income/.test(intent)) {
    const dimField =
      fields.find((f) => /category|account/i.test(f)) ?? "category";
    const valueField = /credit/.test(name) ? ctx.metric.name : "credit";
    return {
      ...panel,
      type: "cartesian",
      title: panel.title ?? "Revenue breakdown",
      theme: "clean",
      mode: "interactive",
      encoding: { x: { field: dimField, type: "nominal" } },
      marks: [
        {
          type: "bar",
          field: valueField,
          label: "Credit",
          tone: "success",
          labels: true,
        },
      ],
    };
  }

  return panel;
}

export const ledgerRulePack: VerticalRulePack = {
  id: "ledger",
  colorFieldPriority: ["category", "status", "account", "paymentMethod"],
  sizeFieldPriority: ["debit", "credit", "volume", "balance", "amount"],
  extraColorIntent: /breakdown|by category|by cost|payment method/i,
  applyPanelRules: applyLedgerPanelRules,
};
