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

  it("suggests sre-incident for SRE vertical tags", () => {
    const template = suggestTemplate({
      metrics: [{ name: "mttr", tags: { vertical: "sre" } }],
    });

    expect(template).toBe("sre-incident");
  });

  it("suggests saas-growth for SaaS vertical tags", () => {
    const template = suggestTemplate({
      metrics: [{ name: "mrr", tags: { vertical: "saas" } }],
    });

    expect(template).toBe("saas-growth");
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

  it("infers encoding.size for volume bar metrics from profile fields", () => {
    const panel = planPanelFromMetric(
      { name: "volume", unit: "units" },
      {
        profileFields: ["week", "volume", "weight"],
      },
    );

    expect(panel.type).toBe("bar");
    expect(panel.encoding?.size).toEqual({
      field: "weight",
      type: "quantitative",
    });
  });

  it("infers props.style.line.curve from intent on line panels", () => {
    const panel = planPanelFromMetric(
      { name: "latency", unit: "ms" },
      { intent: "Linear latency trend by hour" },
    );

    expect(panel.type).toBe("line");
    expect(panel.props?.style).toEqual({ line: { curve: "linear" } });
  });

  it("infers encoding.size and line curve across profile planning", () => {
    const panels = planPanelsFromProfile(
      {
        metrics: [{ name: "throughput", unit: "req/min" }],
        fields: ["week", "throughput", "volume", "aboveTarget"],
      },
      { intent: "Throughput sized by volume with smooth curve" },
    );

    expect(panels[0]?.encoding?.size?.field).toBe("volume");
    expect(panels[0]?.props?.style).toEqual({ line: { curve: "monotone" } });
  });
});
