import { describe, expect, it } from "vitest";
import { formatAxisCategoryLabel } from "./axisCategoryLabel";

describe("formatAxisCategoryLabel", () => {
  it("shortens ISO dates", () => {
    expect(formatAxisCategoryLabel("2026-03-31")).toBe("Mar 31");
    expect(formatAxisCategoryLabel("2026-01-01")).toBe("Jan 1");
  });

  it("passes through non-date labels", () => {
    expect(formatAxisCategoryLabel("Mon")).toBe("Mon");
    expect(formatAxisCategoryLabel("09:30")).toBe("09:30");
  });
});
