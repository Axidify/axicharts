import type { PanelSpec } from "../types";
import type { VerticalPanelContext, VerticalRulePack } from "./types";

function inferFinanceKpiTone(name: string): "success" | "warning" | "critical" | "default" {
  if (/margin|profit|revenue|ebitda|eps|roi/.test(name)) return "success";
  if (/loss|expense|cost|debt/.test(name)) return "warning";
  return "default";
}

function applyFinancePanelRules(panel: PanelSpec, ctx: VerticalPanelContext): PanelSpec {
  const name = ctx.metric.name.toLowerCase();
  const intent = ctx.intent?.toLowerCase() ?? "";
  const fields = ctx.profileFields ?? [];

  if (
    /margin|profit|ebitda|eps|roi/.test(name) ||
    /kpi|stat panel|headline/.test(intent)
  ) {
    return {
      ...panel,
      type: "stat",
      theme: "clean",
      mode: intent.includes("deck") || intent.includes("presentation") ? "presentation" : "interactive",
      encoding: { value: { field: ctx.metric.name, type: "quantitative" } },
      props: {
        label: ctx.metric.name,
        tone: inferFinanceKpiTone(name),
        monospace: true,
      },
      valueSuffix: ctx.metric.unit ? ` ${ctx.metric.unit}` : undefined,
    };
  }

  if (
    /variance|bridge|waterfall|pnl/.test(name) ||
    /waterfall|variance|bridge|walk/.test(intent)
  ) {
    return {
      ...panel,
      type: "waterfall",
      theme: "clean",
      mode: "interactive",
      props: {
        valueFormat: ctx.metric.unit === "USD" || /revenue|usd/i.test(name) ? "currency" : "number",
      },
    };
  }

  if (
    (/revenue|margin/.test(name) || /revenue|margin/.test(intent)) &&
    /revenue.*margin|margin.*revenue|dual[\s-]?axis|combo/.test(intent)
  ) {
    const revenueField = fields.find((f) => /revenue/i.test(f)) ?? "revenue";
    const marginField = fields.find((f) => /margin/i.test(f)) ?? "margin";
    const periodField =
      fields.find((f) => /week|month|period|quarter|date/i.test(f)) ?? "period";

    return {
      ...panel,
      type: "combo",
      theme: "clean",
      mode: "interactive",
      encoding: {
        x: { field: periodField, type: "nominal" },
        y: [
          { field: revenueField, type: "quantitative", kind: "bar", label: "Revenue" },
          { field: marginField, type: "quantitative", kind: "line", label: "Margin" },
        ],
      },
      props: { dualAxis: "auto", showValues: true },
    };
  }

  return panel;
}

export const financeRulePack: VerticalRulePack = {
  id: "finance",
  colorFieldPriority: [
    "vsPlan",
    "vs_plan",
    "beatEstimate",
    "beat_estimate",
    "variance",
    "favorable",
    "unfavorable",
    "aboveTarget",
    "above_target",
    "status",
  ],
  sizeFieldPriority: ["revenue", "units", "volume", "headcount", "weight"],
  extraColorIntent:
    /vs\s*plan|beat\s*estimate|miss\s*estimate|variance|favorable|unfavorable|color\s*by\s*plan/i,
  extraSizeIntent: /revenue\s*scale|sized?\s*by\s*revenue|bar\s*width\s*by\s*units/i,
  applyPanelRules: applyFinancePanelRules,
};
