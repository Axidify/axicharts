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

  it("suggests plugins-wall for plugin vertical tags", () => {
    const template = suggestTemplate({
      metrics: [{ name: "tank_level", tags: { vertical: "plugins" } }],
    });

    expect(template).toBe("plugins-wall");
  });

  it("maps share metrics to donut panels", () => {
    const panel = planPanelFromMetric({
      name: "revenue_share",
      kind: "distribution",
      tags: { vertical: "finance" },
    });

    expect(panel.type).toBe("donut");
  });

  it("maps position metrics to table panels", () => {
    const panel = planPanelFromMetric({
      name: "open_positions",
      tags: { vertical: "trading" },
    });

    expect(panel.type).toBe("table");
    expect(panel.props?.compact).toBe(true);
  });

  it("plans one panel per metric", () => {
    const panels = planPanelsFromProfile({
      metrics: [{ name: "cpu" }, { name: "errors" }],
    });

    expect(panels).toHaveLength(2);
    expect(panels[0]?.type).toBe("line");
  });

  it("infers encoding.color from profile fields for throughput metrics", () => {
    const panel = planPanelFromMetric(
      { name: "throughput", unit: "req/min" },
      {
        profileFields: ["week", "throughput", "aboveTarget"],
      },
    );

    expect(panel.type).toBe("line");
    expect(panel.encoding?.color).toEqual({
      field: "aboveTarget",
      type: "semantic",
    });
  });

  it("infers encoding.color across profile planning with intent", () => {
    const panels = planPanelsFromProfile(
      {
        metrics: [{ name: "p95_latency", unit: "ms" }],
        fields: ["time", "p95_latency", "meets_slo"],
      },
      { intent: "Latency vs SLO — color by target" },
    );

    expect(panels[0]?.encoding?.color?.field).toBe("meets_slo");
  });
});
