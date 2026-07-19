import { financeRulePack } from "./finance";
import { ledgerRulePack } from "./ledger";
import { opsRulePack } from "./ops";
import { tradingRulePack } from "./trading";
import type { VerticalId, VerticalPanelContext, VerticalRulePack } from "./types";

const PACKS: Record<VerticalId, VerticalRulePack> = {
  finance: financeRulePack,
  ledger: ledgerRulePack,
  trading: tradingRulePack,
  ops: opsRulePack,
};

export type { VerticalId, VerticalPanelContext, VerticalRulePack } from "./types";
export { financeRulePack, ledgerRulePack, tradingRulePack, opsRulePack };

export function resolveVerticalId(ctx: VerticalPanelContext): VerticalId | undefined {
  const tag = ctx.metric.tags?.vertical;
  if (tag === "finance" || tag === "ledger" || tag === "trading" || tag === "ops") {
    return tag;
  }

  const intent = ctx.intent?.toLowerCase() ?? "";
  if (/ledger|journal|gl\b|payment method|debit|credit/.test(intent)) return "ledger";
  if (/finance|p&l|pnl|revenue|margin|variance/.test(intent)) return "finance";
  if (/trading|blotter|candlestick|positions|ohlc/.test(intent)) return "trading";
  if (/ops|line|shift|plant|telemetry|alarm|2x2/.test(intent)) return "ops";

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
