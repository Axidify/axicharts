import { describe, expect, it } from "vitest";
import { planFromIntent, planFromProfile } from "./plan";
import { createMockPlannerProvider, planWithProvider } from "./provider";
import { validateDashboardPlan } from "./validate";

const profile = {
  metrics: [
    { name: "cpu", unit: "%", tags: { vertical: "ops", refresh: "live" } },
    { name: "memory", unit: "%", tags: { vertical: "ops", refresh: "live" } },
    { name: "p95", unit: "ms", tags: { vertical: "ops", refresh: "live" } },
    { name: "errors", unit: "/min", tags: { vertical: "ops", refresh: "live" } },
  ],
};

describe("planFromIntent", () => {
  it("maps line 3 night shift to ops template", () => {
    const plan = planFromIntent(profile, "Line 3 night shift overview");
    expect(plan.template).toBe("ops-2x2");
    expect(plan.title).toBe("Line 3");
    expect(plan.subtitle).toBe("Night shift overview");
    expect(plan.feed).toBe("historian");
  });

  it("maps finance intent to finance template", () => {
    const plan = planFromIntent(profile, "Finance P&L board deck");
    expect(plan.template).toBe("finance-pnl");
    expect(plan.presentation).toBe(true);
  });

  it("maps mosaic wall intent to preset", () => {
    const plan = planFromIntent(profile, "Trading desk program mosaic wall");
    expect(plan.layout).toBe("mosaic");
    expect(plan.mosaicPreset).toBe("trading-program");
  });

  it("maps command center mosaic to capacity preset", () => {
    const plan = planFromIntent(profile, "Plant command center mosaic wall");
    expect(plan.layout).toBe("mosaic");
    expect(plan.mosaicPreset).toBe("command-center");
  });

  it("maps mqtt intent to mqtt feed", () => {
    const plan = planFromIntent(profile, "MQTT plant floor sparkplug telemetry");
    expect(plan.feed).toBe("mqtt");
    expect(plan.template).toBe("ops-2x2");
  });

  it("maps websocket push intent to websocket feed", () => {
    const plan = planFromIntent(profile, "WebSocket push feed trading desk");
    expect(plan.feed).toBe("websocket");
    expect(plan.template).toBe("trading-blotter");
  });

  it("maps static snapshot intent to static feed", () => {
    const plan = planFromIntent(profile, "Static CSV snapshot batch report");
    expect(plan.feed).toBe("static");
  });

  it("maps rest polling intent to rest feed", () => {
    const plan = planFromIntent(profile, "REST API polling /api/metrics endpoint");
    expect(plan.feed).toBe("rest");
    expect(plan.template).toBe("ops-2x2");
  });

  it("maps mock-live demo intent to mock-live feed", () => {
    const plan = planFromIntent(profile, "Mock-live synthetic demo drift sandbox");
    expect(plan.feed).toBe("mock-live");
  });

  it("infers encoding.color on panels when intent requests target coloring", () => {
    const plan = planFromIntent(
      {
        metrics: [{ name: "throughput", unit: "req/min" }],
        fields: ["week", "throughput", "aboveTarget"],
      },
      "Weekly throughput color by above target",
    );

    expect(plan.panels[0]?.encoding?.color).toEqual({
      field: "aboveTarget",
      type: "semantic",
    });
  });

  it("infers encoding.size when intent requests proportional bars", () => {
    const plan = planFromIntent(
      {
        metrics: [{ name: "throughput", unit: "req/min" }],
        fields: ["week", "throughput", "volume"],
      },
      "Weekly throughput sized by volume",
    );

    expect(plan.panels[0]?.encoding?.size).toEqual({
      field: "volume",
      type: "quantitative",
    });
  });

  it("infers props.style.line.curve when intent requests linear lines", () => {
    const plan = planFromIntent(
      {
        metrics: [{ name: "latency", unit: "ms" }],
        fields: ["time", "latency"],
      },
      "Linear latency trend",
    );

    expect(plan.panels[0]?.props?.style).toEqual({ line: { curve: "linear" } });
  });

  it("finance vertical: infers waterfall from variance intent", () => {
    const plan = planFromIntent(
      {
        metrics: [{ name: "revenue_variance", unit: "USD" }],
        fields: ["period", "value", "vsPlan"],
      },
      "Finance P&L variance waterfall bridge",
    );

    expect(plan.template).toBe("finance-pnl");
    expect(plan.panels[0]?.type).toBe("waterfall");
  });

  it("trading vertical: infers candlestick brush hints from blotter intent", () => {
    const plan = planFromIntent(
      {
        metrics: [{ name: "AAPL", kind: "ohlc" }],
        fields: ["time", "open", "high", "low", "close", "volume"],
      },
      "Trading blotter candlestick with volume",
    );

    expect(plan.template).toBe("trading-blotter");
    expect(plan.panels[0]?.type).toBe("candlestick");
    expect(plan.panels[0]?.props?.brush).toBe(true);
    expect(plan.panels[0]?.props?.syncId).toBe("ohlc");
  });

  it("ops vertical: infers alert panel from alarm intent", () => {
    const plan = planFromIntent(
      {
        metrics: [{ name: "alarms" }],
        fields: ["id", "message", "severity"],
      },
      "Ops alarm panel for line 3 active alarms",
    );

    expect(plan.template).toBe("ops-2x2");
    expect(plan.panels[0]?.type).toBe("alert");
  });
});

describe("planFromProfile", () => {
  it("uses rules planner without intent", () => {
    const plan = planFromProfile(profile);
    expect(plan.source).toBe("rules");
    expect(plan.panels.length).toBe(4);
  });
});

describe("planWithProvider", () => {
  it("falls back when provider output is invalid", async () => {
    const provider = createMockPlannerProvider("{ not valid json");
    const plan = await planWithProvider(profile, "Line 3 overview", provider);
    expect(plan.template).toBe("ops-2x2");
    expect(plan.warnings?.[0]).toContain("rules fallback");
  });

  it("accepts valid provider JSON", async () => {
    const provider = createMockPlannerProvider(
      JSON.stringify({
        template: "ops-2x2",
        layout: "embed",
        feed: "historian",
        presentation: false,
        panels: [
          {
            specVersion: 1,
            type: "line",
            title: "CPU",
            encoding: {
              x: { field: "time", type: "nominal" },
              y: { field: "cpu", type: "quantitative" },
            },
          },
        ],
      }),
    );

    const plan = await planWithProvider(profile, "Line 3 overview", provider);
    expect(plan.source).toBe("llm");
    expect(validateDashboardPlan(plan)).not.toBeNull();
  });

  it("accepts websocket and mqtt feeds from provider JSON", async () => {
    for (const feed of ["websocket", "mqtt", "rest", "mock-live"] as const) {
      const provider = createMockPlannerProvider(
        JSON.stringify({
          template: "ops-2x2",
          layout: "embed",
          feed,
          presentation: false,
          panels: [
            {
              specVersion: 1,
              type: "line",
              title: "CPU",
              encoding: {
                x: { field: "time", type: "nominal" },
                y: { field: "cpu", type: "quantitative" },
              },
            },
          ],
        }),
      );

      const plan = await planWithProvider(profile, `${feed} desk`, provider);
      expect(plan.feed).toBe(feed);
      expect(validateDashboardPlan(plan)?.feed).toBe(feed);
    }
  });
});
