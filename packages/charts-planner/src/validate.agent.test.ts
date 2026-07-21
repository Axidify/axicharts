import { describe, expect, it } from "vitest";
import { validateAgentDashboardPlan } from "./validate";

describe("validateAgentDashboardPlan", () => {
  it("rejects legacy donut panels", () => {
    const plan = validateAgentDashboardPlan({
      template: "saas-growth",
      layout: "embed",
      panels: [
        {
          specVersion: 1,
          type: "donut",
          title: "Share",
          theme: "clean",
          mode: "interactive",
        },
      ],
    });
    expect(plan).toBeNull();
  });

  it("accepts agent cartesian panels", () => {
    const plan = validateAgentDashboardPlan({
      template: "ops-2x2",
      layout: "embed",
      panels: [
        {
          specVersion: 1,
          type: "cartesian",
          title: "cpu",
          theme: "live",
          mode: "live",
          encoding: { x: { field: "time", type: "nominal" } },
          marks: [{ type: "line", field: "cpu", label: "cpu" }],
        },
      ],
    });
    expect(plan?.agentSafe).toBe(true);
    expect(plan?.plannerKind).toBe("tabular");
  });
});
