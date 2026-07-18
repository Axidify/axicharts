import type { PanelSpec } from "../types";
import type { VerticalPanelContext, VerticalRulePack } from "./types";

function applyTradingPanelRules(panel: PanelSpec, ctx: VerticalPanelContext): PanelSpec {
  const name = ctx.metric.name.toLowerCase();
  const intent = ctx.intent?.toLowerCase() ?? "";
  const kind = ctx.metric.kind;
  const fields = ctx.profileFields ?? [];

  if (
    kind === "ohlc" ||
    /ohlc|candle|price|symbol/.test(name) ||
    /candlestick|ohlc|price\s*chart|trading\s*desk/.test(intent)
  ) {
    const volumeField = fields.find((f) => /^volume$/i.test(f) || /volume/i.test(f));
    return {
      ...panel,
      type: "candlestick",
      theme: "live",
      mode: "live",
      encoding: {
        x: { field: "time", type: "nominal" },
        open: { field: "open", type: "quantitative" },
        high: { field: "high", type: "quantitative" },
        low: { field: "low", type: "quantitative" },
        close: { field: "close", type: "quantitative" },
      },
      props: {
        ...panel.props,
        brush: true,
        brushEnd: 45,
        sessionShading: "rth",
        syncId: "ohlc",
        ...(volumeField || /volume|vwap/.test(intent)
          ? { volumeField: volumeField ?? "volume" }
          : {}),
      },
    };
  }

  if (/rsi|macd|stochastic|momentum/.test(name) || /rsi|momentum|follower|oscillator/.test(intent)) {
    return {
      ...panel,
      type: "line",
      theme: "live",
      mode: "live",
      fill: true,
      props: {
        ...panel.props,
        syncId: "rsi",
        syncFollower: "ohlc",
        tone: "warning",
      },
    };
  }

  if (/volume|vwap/.test(name)) {
    return {
      ...panel,
      type: "bar",
      theme: "live",
      mode: "live",
      props: {
        ...panel.props,
        syncId: "volume",
      },
    };
  }

  if (/position|blotter|order/.test(name)) {
    return {
      ...panel,
      type: "table",
      theme: "live",
      mode: "live",
      encoding: undefined,
      props: {
        columns: [
          { key: "symbol", label: "Symbol", monospace: true },
          { key: "side", label: "Side" },
          { key: "qty", label: "Qty", align: "right", monospace: true },
          { key: "pnl", label: "P&L", align: "right", monospace: true, toneKey: "pnlTone" },
        ],
        rows: [],
        compact: true,
        surface: "dark",
      },
    };
  }

  return panel;
}

export const tradingRulePack: VerticalRulePack = {
  id: "trading",
  colorFieldPriority: [
    "side",
    "pnl",
    "pnlTone",
    "exposure",
    "direction",
    "aboveTarget",
    "status",
    "severity",
  ],
  sizeFieldPriority: ["volume", "qty", "quantity", "notional", "exposure", "weight"],
  extraColorIntent: /color\s*by\s*side|color\s*by\s*pnl|color\s*by\s*exposure|long\s*\/\s*short/i,
  extraSizeIntent: /size\s*by\s*volume|sized?\s*by\s*notional|bar\s*width\s*by\s*qty/i,
  applyPanelRules: applyTradingPanelRules,
};
