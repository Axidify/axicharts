import { describe, expect, it } from "vitest";
import { planPanelFromMetric, planPanelsFromProfile, suggestTemplate } from "./plan";

describe("plan", () => {
  it("maps latency metrics to live line panels", () => {
    const panel = planPanelFromMetric({
      name: "p95_latency",
      unit: "ms",
      tags: { vertical: "ops", refresh: "live" },
    });

    expect(panel.type).toBe("line");
    expect(panel.mode).toBe("live");
    expect(panel.theme).toBe("live");
    expect(panel.valueSuffix).toBe(" ms");
  });

  it("maps ohlc metrics to candlestick", () => {
    const panel = planPanelFromMetric({
      name: "AAPL",
      kind: "ohlc",
      tags: { vertical: "trading" },
    });

    expect(panel.type).toBe("candlestick");
    expect(panel.mode).toBe("live");
  });

  it("suggests templates from profile tags", () => {
    const template = suggestTemplate({
      metrics: [
        { name: "revenue", tags: { vertical: "finance" } },
        { name: "margin", tags: { vertical: "finance" } },
      ],
    });

    expect(template).toBe("finance-pnl");
  });

  it("plans one panel per metric", () => {
    const panels = planPanelsFromProfile({
      metrics: [{ name: "cpu" }, { name: "errors" }],
    });

    expect(panels).toHaveLength(2);
    expect(panels[0]?.type).toBe("line");
  });
});
