import { describe, expect, it } from "vitest";
import { validateCartesianSpec } from "./cartesianValidation";

const ROWS = [
  { week: "W1", revenue: 42, target: 40 },
  { week: "W2", revenue: 48, target: 44 },
];

const VALID = {
  type: "cartesian" as const,
  encoding: { x: { field: "week" } },
  marks: [
    { type: "bar" as const, field: "revenue" },
    { type: "line" as const, field: "target" },
  ],
};

describe("validateCartesianSpec (RFC-002 simulation gates)", () => {
  it("S04/S05 allow valid combo marks", () => {
    const result = validateCartesianSpec(
      {
        ...VALID,
        marks: [
          { type: "bar", field: "revenue" },
          { type: "line", field: "target" },
          { type: "rule", value: 50 },
          { type: "band", min: 40, max: 50 },
        ],
      },
      { rows: ROWS },
    );
    expect(result.ok).toBe(true);
  });

  it("S11 rejects overlay-only", () => {
    const result = validateCartesianSpec(
      {
        type: "cartesian",
        encoding: { x: { field: "week" } },
        marks: [
          { type: "rule", value: 50 },
          { type: "band", min: 40, max: 50 },
        ],
      },
      { rows: ROWS },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.code === "MISSING_DATA_MARK")).toBe(
        true,
      );
    }
  });

  it("S12 rejects empty marks", () => {
    const result = validateCartesianSpec(
      {
        type: "cartesian",
        encoding: { x: { field: "week" } },
        marks: [],
      },
      { rows: ROWS },
    );
    expect(result.ok).toBe(false);
  });

  it("S13 unknown field with suggestion", () => {
    const result = validateCartesianSpec(
      {
        type: "cartesian",
        encoding: { x: { field: "week" } },
        marks: [{ type: "bar", field: "revnue" }],
      },
      { rows: ROWS },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const err = result.errors.find((e) => e.code === "UNKNOWN_FIELD");
      expect(err?.path).toBe("marks[0].field");
      expect(err?.suggestion).toBe("revenue");
    }
  });

  it("S14 rejects non-numeric field values", () => {
    const result = validateCartesianSpec(
      {
        type: "cartesian",
        encoding: { x: { field: "week" } },
        marks: [{ type: "bar", field: "revenue" }],
      },
      {
        rows: [
          { week: "W1", revenue: "n/a" },
          { week: "W2", revenue: "bad" },
        ],
      },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.code === "INVALID_FIELD_TYPE")).toBe(
        true,
      );
    }
  });

  it("S15 rejects empty rows", () => {
    const result = validateCartesianSpec(VALID, { rows: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.code === "EMPTY_DATA")).toBe(true);
    }
  });

  it("S18 rejects inverted band", () => {
    const result = validateCartesianSpec(
      {
        type: "cartesian",
        encoding: { x: { field: "week" } },
        marks: [
          { type: "line", field: "revenue" },
          { type: "band", min: 52, max: 44 },
        ],
      },
      { rows: ROWS },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.code === "INVALID_BAND_RANGE")).toBe(
        true,
      );
    }
  });

  it("S19 rejects unknown mark", () => {
    const result = validateCartesianSpec(
      {
        type: "cartesian",
        encoding: { x: { field: "week" } },
        marks: [{ mark: "point", field: "revenue" }],
      },
      { rows: ROWS },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.code === "UNKNOWN_MARK")).toBe(true);
    }
  });

  it("S22b warns on duplicate overlay channels", () => {
    const result = validateCartesianSpec(
      {
        type: "cartesian",
        encoding: { x: { field: "week" } },
        marks: [
          { type: "bar", field: "revenue" },
          { type: "rule", value: 50 },
        ],
        props: {
          referenceLines: [{ value: 60, label: "props" }],
        },
      },
      { rows: ROWS },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(
        result.warnings.some((w) => w.code === "DUPLICATE_OVERLAY_CHANNEL"),
      ).toBe(true);
    }
  });
});
