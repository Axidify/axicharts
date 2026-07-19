import { describe, expect, it } from "vitest";
import { inferCategoryFieldFromProfile } from "./profileInference";

describe("inferCategoryFieldFromProfile", () => {
  it("prefers time-like field names over metrics", () => {
    expect(
      inferCategoryFieldFromProfile(
        ["week", "cpu", "memory"],
        ["cpu", "memory"],
      ),
    ).toBe("week");
  });

  it("uses date and month aliases", () => {
    expect(
      inferCategoryFieldFromProfile(
        ["revenue", "month"],
        ["revenue"],
      ),
    ).toBe("month");
  });

  it("falls back to first non-metric field", () => {
    expect(
      inferCategoryFieldFromProfile(
        ["region", "sales"],
        ["sales"],
      ),
    ).toBe("region");
  });

  it("defaults to time when only metrics listed", () => {
    expect(inferCategoryFieldFromProfile(["cpu", "memory"], ["cpu", "memory"])).toBe(
      "time",
    );
  });
});
