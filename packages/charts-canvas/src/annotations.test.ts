import { describe, expect, it } from "vitest";
import {
  categoryToIndex,
  extraYValuesFromAnnotations,
  resolvePlotAnnotations,
} from "./annotations";

describe("resolvePlotAnnotations", () => {
  it("maps band annotations to threshold bands", () => {
    const resolved = resolvePlotAnnotations({
      annotations: [
        { type: "band", min: 70, max: 85, label: "Warn", tone: "warning" },
      ],
    });
    expect(resolved.thresholdBands).toEqual([
      { min: 70, max: 85, label: "Warn", tone: "warning" },
    ]);
  });

  it("maps horizontal line annotations to reference lines", () => {
    const resolved = resolvePlotAnnotations({
      annotations: [{ type: "line", value: 90, label: "SLO", tone: "critical" }],
    });
    expect(resolved.referenceLines).toEqual([
      { value: 90, label: "SLO", tone: "critical" },
    ]);
  });

  it("maps vertical line annotations separately", () => {
    const resolved = resolvePlotAnnotations({
      annotations: [
        {
          type: "line",
          value: 0,
          orientation: "vertical",
          x: "Q3",
          label: "Review",
        },
      ],
    });
    expect(resolved.verticalLines).toEqual([
      { x: "Q3", label: "Review", tone: undefined },
    ]);
    expect(resolved.referenceLines).toEqual([]);
  });

  it("merges legacy threshold bands and reference lines", () => {
    const resolved = resolvePlotAnnotations({
      thresholdBands: [{ min: 0, max: 50, tone: "info" }],
      referenceLines: [{ value: 75 }],
      annotations: [{ type: "label", text: "Peak", x: 2, y: 120 }],
    });
    expect(resolved.thresholdBands).toHaveLength(1);
    expect(resolved.referenceLines).toHaveLength(1);
    expect(resolved.labels).toEqual([{ text: "Peak", x: 2, y: 120 }]);
  });
});

describe("categoryToIndex", () => {
  it("resolves category names and numeric indices", () => {
    const categories = ["Mon", "Tue", "Wed"];
    expect(categoryToIndex("Tue", categories)).toBe(1);
    expect(categoryToIndex(2, categories)).toBe(2);
    expect(categoryToIndex("Thu", categories)).toBeNull();
  });
});

describe("extraYValuesFromAnnotations", () => {
  it("collects label and marker y values for range expansion", () => {
    const resolved = resolvePlotAnnotations({
      annotations: [
        { type: "label", text: "A", y: 200 },
        { type: "marker", y: 50, draggable: true },
      ],
    });
    expect(extraYValuesFromAnnotations(resolved)).toEqual([200, 50]);
  });
});
