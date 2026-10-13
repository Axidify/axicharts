import { describe, expect, it } from "vitest";
import { normalizeToCartesian } from "./normalizeToCartesian";
import { withMarkKeyAlias } from "./testing/markKeyAlias";

describe("normalizeToCartesian", () => {
  it("renames blocks to cartesian", () => {
    const spec = normalizeToCartesian({
      type: "blocks",
      encoding: { x: { field: "week" } },
      marks: [{ type: "bar", field: "revenue" }],
    });
    expect(spec.type).toBe("cartesian");
    expect(spec.marks[0]).toEqual({ type: "bar", field: "revenue" });
  });

  it("normalizes mark key alias to type", () => {
    const spec = normalizeToCartesian({
      type: "cartesian",
      encoding: { x: { field: "week" } },
      marks: withMarkKeyAlias([{ mark: "line", field: "target", label: "Target" }]),
    });
    expect(spec.marks[0]).toEqual({
      type: "line",
      field: "target",
      label: "Target",
    });
  });

  it("converts combo encoding to marks", () => {
    const spec = normalizeToCartesian({
      type: "combo",
      encoding: {
        x: { field: "week" },
        y: [
          { field: "revenue", kind: "bar", label: "Revenue" },
          { field: "target", kind: "line", label: "Target" },
        ],
      },
    });
    expect(spec.type).toBe("cartesian");
    expect(spec.marks).toEqual([
      { type: "bar", field: "revenue", label: "Revenue" },
      { type: "line", field: "target", label: "Target" },
    ]);
  });

  it("converts line panel to single line mark", () => {
    const spec = normalizeToCartesian({
      type: "line",
      encoding: {
        x: { field: "week" },
        y: { field: "revenue", label: "Revenue" },
      },
    });
    expect(spec.marks).toEqual([
      { type: "line", field: "revenue", label: "Revenue" },
    ]);
  });

  it("merges legacy referenceLines into rule marks", () => {
    const spec = normalizeToCartesian({
      type: "line",
      encoding: { x: { field: "week" }, y: { field: "revenue" } },
      props: {
        referenceLines: [{ value: 50, label: "Quota" }],
      },
    });
    expect(spec.marks.some((m) => m.type === "rule" && m.value === 50)).toBe(
      true,
    );
  });

  it("converts every annotation type into marks", () => {
    const spec = normalizeToCartesian({
      type: "cartesian",
      encoding: { x: { field: "week" } },
      marks: [{ type: "line", field: "revenue" }],
      annotations: [
        { type: "line", value: 90, label: "SLO" },
        { type: "band", min: 0, max: 50, label: "Healthy" },
        { type: "label", text: "Peak", y: 55 },
      ],
    });
    expect(spec.marks.some((m) => m.type === "rule" && m.value === 90)).toBe(true);
    expect(spec.marks.some((m) => m.type === "band" && m.min === 0)).toBe(true);
    expect(spec.marks).toContainEqual({ type: "text", text: "Peak", y: 55 });
    expect(spec.annotations).toBeUndefined();
  });

  it("keeps x, id, tone and orientation when converting legacy overlays", () => {
    const spec = normalizeToCartesian({
      type: "line",
      encoding: { x: { field: "week" }, y: { field: "revenue" } },
      props: {
        referenceLines: [{ value: 80, label: "Target", tone: "warning" }],
        thresholdBands: [{ min: 0, max: 20, tone: "critical" }],
        annotations: [
          { type: "line", value: 0, orientation: "vertical", x: "W3", id: "launch" },
          { type: "marker", x: "W5", y: 120, label: "Peak", draggable: true, id: "p" },
          { type: "label", text: "Note", y: 40, position: "top", tone: "info" },
        ],
      },
    });
    expect(spec.marks).toEqual([
      { type: "line", field: "revenue" },
      { type: "rule", value: 80, label: "Target", tone: "warning" },
      { type: "band", min: 0, max: 20, tone: "critical" },
      { type: "rule", value: 0, orientation: "vertical", x: "W3", id: "launch" },
      { type: "marker", y: 120, x: "W5", label: "Peak", draggable: true, id: "p" },
      { type: "text", text: "Note", y: 40, tone: "info", position: "top" },
    ]);
    expect(spec.props?.referenceLines).toBeUndefined();
    expect(spec.props?.thresholdBands).toBeUndefined();
    expect(spec.props?.annotations).toBeUndefined();
  });
});
