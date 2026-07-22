import { describe, expect, it } from "vitest";
import {
  buildAgentChartEnvelope,
  visualizationHintForPanel,
  withAgentChartEnvelope,
} from "./agentChartEnvelope";

describe("agentChartEnvelope", () => {
  it("maps cartesian panels to chart visualization hint", () => {
    const panel = {
      type: "cartesian" as const,
      title: "By status",
      encoding: { x: { field: "status" } },
      marks: [{ type: "bar" as const, field: "count" }],
    };
    expect(visualizationHintForPanel(panel)).toBe("chart");
  });

  it("builds RFC-005 envelope for valid cartesian panel", () => {
    const panel = {
      type: "cartesian" as const,
      title: "By status",
      encoding: { x: { field: "status" } },
      marks: [{ type: "bar" as const, field: "count" }],
    };
    const rows = [
      { status: "open", count: 2 },
      { status: "closed", count: 5 },
    ];
    const envelope = buildAgentChartEnvelope(panel, rows);
    expect("error" in envelope).toBe(false);
    if ("error" in envelope) return;
    expect(envelope.specVersion).toBe(1);
    expect(envelope.visualizationHint).toBe("chart");
    expect(envelope.data).toEqual(rows);
    expect(envelope.panel.type).toBe("cartesian");
  });

  it("returns structured spec error with user-facing hints", () => {
    const panel = {
      type: "cartesian" as const,
      encoding: {},
      marks: [{ type: "bar" as const, field: "missing" }],
    };
    const result = buildAgentChartEnvelope(panel, [{ other: 1 }]);
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toBe("invalid_chart_spec");
    expect(result.codes.length).toBeGreaterThan(0);
    expect(result.hints.length).toBeGreaterThan(0);
  });

  it("withAgentChartEnvelope attaches envelope on planner blocks", () => {
    const block = withAgentChartEnvelope({
      questionId: "generic.chart.status",
      panel: {
        type: "cartesian",
        title: "Status",
        encoding: { x: { field: "status" } },
        marks: [{ type: "bar", field: "count" }],
      },
      rows: [{ status: "open", count: 1 }],
      decision: {
        step: "test",
        api: "test",
        status: "validated",
        notes: "test",
      },
      validationIssues: [],
    });
    expect(block.envelope?.specVersion).toBe(1);
    expect(block.chartSpecError).toBeUndefined();
  });
});
