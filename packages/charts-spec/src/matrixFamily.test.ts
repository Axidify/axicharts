import { describe, expect, it } from "vitest";
import {
  createMatrixPanel,
  createPanel,
  listMarks,
  normalizeToMatrix,
  validateMatrixSpec,
  validatePanel,
} from "./index";

const SAMPLE_ROWS = [
  { hour: "09:00", day: "Mon", latency: 42 },
  { hour: "10:00", day: "Mon", latency: 55 },
  { hour: "09:00", day: "Tue", latency: 38 },
  { hour: "10:00", day: "Tue", latency: 61 },
];

describe("matrix family (RFC-004 C186)", () => {
  it("createPanel dispatches matrix family", () => {
    const result = createPanel({
      family: "matrix",
      intent: "latency heatmap by hour and day",
      fields: ["hour", "day", "latency"],
    });
    expect(result.family).toBe("matrix");
    expect(result.panel.type).toBe("matrix");
    expect(result.panel.marks?.some((mark) => mark.type === "cell")).toBe(true);
  });

  it("listMarks returns closed matrix catalog", () => {
    const result = listMarks("matrix");
    expect(result.closedSet).toEqual(["cell", "colorScale", "axis"]);
  });

  it("normalizes legacy heatmap to matrix marks", () => {
    const normalized = normalizeToMatrix({
      type: "heatmap",
      encoding: {
        x: { field: "hour" },
        y: { field: "day" },
        value: { field: "latency" },
      },
    });
    expect(normalized.type).toBe("matrix");
    expect(normalized.marks?.some((mark) => mark.type === "cell")).toBe(true);
  });

  it("validatePanel accepts normalized matrix spec", () => {
    const panel = createMatrixPanel({
      intent: "heatmap grid",
      fields: ["hour", "day", "latency"],
      xField: "hour",
      yField: "day",
      valueField: "latency",
    }).panel;

    const result = validatePanel(panel, { rows: SAMPLE_ROWS, strict: true });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.family).toBe("matrix");
    }
  });

  it("validateMatrixSpec rejects missing cell mark", () => {
    const result = validateMatrixSpec(
      {
        type: "matrix",
        encoding: {
          x: { field: "hour" },
          y: { field: "day" },
          value: { field: "latency" },
        },
        marks: [{ type: "colorScale", field: "latency" }],
      },
      { rows: SAMPLE_ROWS },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((issue) => issue.code === "MISSING_DATA_MARK")).toBe(true);
    }
  });
});
