import { describe, expect, it } from "vitest";
import * as planning from "./entry/planning";

describe("B3 — planning entry agent path", () => {
  it("does not export legacy profile planner APIs", () => {
    expect("planPanelsFromProfile" in planning).toBe(false);
    expect("planPanelFromMetric" in planning).toBe(false);
  });

  it("exports agent-runtime panel guards", () => {
    expect(planning.isAgentRuntimePanelType("cartesian")).toBe(true);
    expect(planning.isAgentRuntimePanelType("donut")).toBe(false);
    expect(planning.LEGACY_PROFILE_PLANNER_PANEL_TYPES.has("gauge")).toBe(true);
  });
});
