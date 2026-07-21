import { describe, expect, it } from "vitest";
import { classifyTabularPanelAgentStatus } from "./tabularPanelAgentStatus";

const ROWS = [
  { week: "W1", revenue: 42 },
  { week: "W2", revenue: 48 },
];

describe("classifyTabularPanelAgentStatus", () => {
  it("marks stat widgets as ok", () => {
    const status = classifyTabularPanelAgentStatus(
      { type: "stat", props: { value: "4", label: "Rows" } },
      ROWS,
    );
    expect(status.status).toBe("ok");
    expect(status.validationIssues).toEqual([]);
  });

  it("validates cartesian panels", () => {
    const status = classifyTabularPanelAgentStatus(
      {
        type: "cartesian",
        encoding: { x: { field: "week" } },
        marks: [{ type: "bar", field: "revenue" }],
      },
      ROWS,
    );
    expect(status.status).toBe("validated");
  });

  it("validates distribution funnel panels", () => {
    const status = classifyTabularPanelAgentStatus(
      {
        type: "distribution",
        encoding: {
          angle: { field: "revenue" },
          color: { field: "week" },
        },
        marks: [{ type: "funnel", field: "revenue" }],
      },
      ROWS,
    );
    expect(status.status).toBe("validated");
  });

  it("flags waterfall as Tier-2 needs_review", () => {
    const status = classifyTabularPanelAgentStatus(
      {
        type: "waterfall",
        props: {
          items: [
            { name: "Rent", value: -3500 },
            { name: "Sales", value: 12000 },
          ],
        },
      },
      ROWS,
    );
    expect(status.status).toBe("needs_review");
    expect(status.validationIssues[0]?.code).toBe("TIER2_PANEL");
  });

  it("validates matrix panels with agent grammar", () => {
    const status = classifyTabularPanelAgentStatus(
      {
        type: "matrix",
        encoding: {
          x: { field: "hour" },
          y: { field: "day" },
          value: { field: "latency" },
        },
        marks: [
          { type: "cell", field: "latency" },
          { type: "colorScale", field: "latency" },
        ],
      },
      [
        { hour: "09:00", day: "Mon", latency: 42 },
        { hour: "10:00", day: "Mon", latency: 55 },
      ],
    );
    expect(status.status).toBe("validated");
  });

  it("flags legacy heatmap without rows as needs_review", () => {
    const status = classifyTabularPanelAgentStatus(
      {
        type: "heatmap",
        encoding: {
          x: { field: "hour" },
          y: { field: "day" },
          value: { field: "latency" },
        },
      },
      [],
    );
    expect(status.status).toBe("needs_review");
    expect(status.validationIssues[0]?.code).toBe("EMPTY_DATA");
  });
});
