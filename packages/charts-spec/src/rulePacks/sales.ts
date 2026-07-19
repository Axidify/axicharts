import type { PanelSpec } from "../types";
import type { VerticalPanelContext, VerticalRulePack } from "./types";

function applySalesPanelRules(panel: PanelSpec, ctx: VerticalPanelContext): PanelSpec {
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

  if (/probability|weighted|forecast/.test(name) || /weighted|forecast/.test(intent)) {
    const dimField = fields.find((f) => /salesperson|rep/i.test(f)) ?? "Salesperson";
    return {
      ...panel,
      type: "cartesian",
      title: panel.title ?? "Weighted forecast",
      theme: "clean",
      mode: "interactive",
      encoding: {
        x: { field: dimField, type: "nominal" },
        y: { field: "weightedValue", type: "quantitative", format: "currency" },
      },
      marks: [
        {
          type: "bar",
          field: "weightedValue",
          label: "Weighted",
          labels: true,
          tone: "warning",
        },
      ],
    };
  }

  if (
    /^(value|pipeline|revenue|deal)\b/.test(name) ||
    /pipeline|value|funnel|stage/.test(intent)
  ) {
    const dimField =
      fields.find((f) => /stage|phase|step/i.test(f)) ??
      fields.find((f) => /salesperson|rep|owner/i.test(f)) ??
      "Stage";
    const valueField = fields.find((f) => /value|amount|revenue/i.test(f)) ?? ctx.metric.name;
    return {
      ...panel,
      type: "cartesian",
      title: panel.title ?? "Pipeline by stage",
      theme: "clean",
      mode: "interactive",
      encoding: {
        x: { field: dimField, type: "nominal" },
        y: { field: valueField, type: "quantitative", format: "currency" },
      },
      marks: [
        {
          type: "bar",
          field: valueField,
          label: "Value",
          labels: true,
          tone: "info",
        },
      ],
    };
  }

  if (/salesperson|rep|owner/.test(intent) || /by rep|by salesperson/.test(intent)) {
    const dimField = fields.find((f) => /salesperson|rep|owner/i.test(f)) ?? "Salesperson";
    const valueField = fields.find((f) => /value|amount/i.test(f)) ?? "Value (RM)";
    return {
      ...panel,
      type: "cartesian",
      title: panel.title ?? "Pipeline by salesperson",
      theme: "clean",
      mode: "interactive",
      encoding: {
        x: { field: dimField, type: "nominal" },
        y: { field: valueField, type: "quantitative", format: "currency" },
      },
      marks: [
        {
          type: "bar",
          field: valueField,
          label: "Value",
          labels: true,
          tone: "success",
        },
      ],
    };
  }

  return panel;
}

export const salesRulePack: VerticalRulePack = {
  id: "sales",
  colorFieldPriority: ["Stage", "Source", "Salesperson", "Customer"],
  sizeFieldPriority: ["Value (RM)", "weightedValue", "Probability"],
  extraColorIntent: /by stage|by source|by salesperson|funnel|breakdown/i,
  applyPanelRules: applySalesPanelRules,
};
