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
});
