import { describe, expect, it } from "vitest";
import { requestDashboardPlan } from "./client";
import { DEFAULT_OPS_PROFILE } from "./index";

describe("requestDashboardPlan", () => {
  it("plans locally when no server URL is provided", async () => {
    const plan = await requestDashboardPlan({
      profile: DEFAULT_OPS_PROFILE,
      intent: "Line 3 night shift overview",
    });
    expect(plan.template).toBe("ops-2x2");
    expect(plan.layout).toBe("embed");
  });
});
