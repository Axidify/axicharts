import { describe, expect, it } from "vitest";
import { validatePanel } from "./validatePanel";
import { toUserFacingHint, toUserFacingHints } from "./userFacingHints";

const ROWS = [{ week: "W1", revenue: 42 }];

describe("toUserFacingHint", () => {
  it("maps MISSING_X_FIELD to a chat-friendly hint", () => {
    const result = validatePanel(
      { type: "cartesian", marks: [{ type: "bar", field: "revenue" }] },
      { rows: ROWS },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const err = result.errors.find((e) => e.code === "MISSING_X_FIELD");
      expect(err).toBeDefined();
      expect(toUserFacingHint(err!)).toMatch(/category field/i);
    }
  });

  it("maps UNKNOWN_FIELD with suggestion", () => {
    const result = validatePanel(
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
      expect(toUserFacingHint(err!)).toContain("revenue");
    }
  });

  it("falls back to message when code is unknown", () => {
    const hint = toUserFacingHint({
      code: "CUSTOM_CODE",
      path: "x",
      message: "Something went wrong",
      severity: "error",
    });
    expect(hint).toBe("Something went wrong");
  });

  it("dedupes hints in toUserFacingHints", () => {
    const hints = toUserFacingHints([
      {
        code: "EMPTY_DATA",
        path: "data",
        message: "At least one data row is required",
        severity: "error",
      },
      {
        code: "EMPTY_DATA",
        path: "data",
        message: "At least one data row is required",
        severity: "error",
      },
    ]);
    expect(hints).toHaveLength(1);
  });
});
