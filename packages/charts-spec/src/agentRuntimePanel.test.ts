import { describe, expect, it } from "vitest";
import { agentRuntimePanelIssues, isAgentRuntimePanelType } from "./agentRuntimePanel";

describe("agentRuntimePanel", () => {
  it("classifies agent-runtime vs legacy profile planner types", () => {
    expect(isAgentRuntimePanelType("cartesian")).toBe(true);
    expect(isAgentRuntimePanelType("distribution")).toBe(true);
    expect(isAgentRuntimePanelType("donut")).toBe(false);
    expect(
      agentRuntimePanelIssues({
        specVersion: 1,
        type: "gauge",
        title: "Utilization",
        theme: "clean",
        mode: "interactive",
      }),
    ).toHaveLength(1);
  });
});
