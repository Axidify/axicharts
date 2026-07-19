import { attendanceRulePack } from "./attendance";
import { financeRulePack } from "./finance";
import { ledgerRulePack } from "./ledger";
import { opsRulePack } from "./ops";
import { salesRulePack } from "./sales";
import { tradingRulePack } from "./trading";
import type { VerticalId, VerticalPanelContext, VerticalRulePack } from "./types";
import { classifyTabularDomain, MIN_DOMAIN_CONFIDENCE_TO_TAG } from "../classifyTabularDomain";

const PACKS: Record<VerticalId, VerticalRulePack> = {
  finance: financeRulePack,
  ledger: ledgerRulePack,
  trading: tradingRulePack,
  ops: opsRulePack,
  attendance: attendanceRulePack,
  sales: salesRulePack,
};

export type { VerticalId, VerticalPanelContext, VerticalRulePack } from "./types";
export {
  attendanceRulePack,
  financeRulePack,
  ledgerRulePack,
  salesRulePack,
  tradingRulePack,
  opsRulePack,
};

export function resolveVerticalId(ctx: VerticalPanelContext): VerticalId | undefined {
  const tag = ctx.metric.tags?.vertical;
  if (
    tag === "finance" ||
    tag === "ledger" ||
    tag === "trading" ||
    tag === "ops" ||
    tag === "attendance" ||
    tag === "sales"
  ) {
    return tag;
  }

  const intent = ctx.intent?.toLowerCase() ?? "";
  if (/pipeline|crm|opportunity|sales funnel|weighted forecast|deal/.test(intent)) {
    return "sales";
  }
  if (/attendance|timesheet|clock[\s-]?in|hr\b|payroll|leave|present|employee/.test(intent)) {
    return "attendance";
  }
  if (/ledger|journal|gl\b|payment method|debit|credit/.test(intent)) return "ledger";
  if (/finance|p&l|pnl|revenue|margin|variance/.test(intent)) return "finance";
  if (/trading|blotter|candlestick|positions|ohlc/.test(intent)) return "trading";
  if (/ops|line|shift|plant|telemetry|alarm|2x2/.test(intent)) return "ops";

  if (ctx.fieldProfiles?.length) {
    const domain = classifyTabularDomain({ fieldProfiles: ctx.fieldProfiles });
    if (domain.vertical !== "generic" && domain.confidence >= MIN_DOMAIN_CONFIDENCE_TO_TAG) {
      return domain.vertical;
    }
  }

  return undefined;
}

export function rulePackForVertical(vertical?: VerticalId): VerticalRulePack | undefined {
  if (!vertical) return undefined;
  return PACKS[vertical];
}

export function colorFieldPriorityForVertical(vertical?: VerticalId): readonly string[] {
  const pack = rulePackForVertical(vertical);
  return pack?.colorFieldPriority ?? [];
}

export function sizeFieldPriorityForVertical(vertical?: VerticalId): readonly string[] {
  const pack = rulePackForVertical(vertical);
  return pack?.sizeFieldPriority ?? [];
}

export function intentWantsVerticalColor(intent: string | undefined, vertical?: VerticalId): boolean {
  if (!intent || !vertical) return false;
  const pack = rulePackForVertical(vertical);
  return pack?.extraColorIntent?.test(intent) ?? false;
}

export function intentWantsVerticalSize(intent: string | undefined, vertical?: VerticalId): boolean {
  if (!intent || !vertical) return false;
  const pack = rulePackForVertical(vertical);
  return pack?.extraSizeIntent?.test(intent) ?? false;
}

export { applyVerticalRules } from "./applyVerticalRules";
export type { ApplyVerticalRulesContext } from "./applyVerticalRules";
