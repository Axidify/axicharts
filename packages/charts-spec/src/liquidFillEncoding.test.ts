import { describe, expect, it } from "vitest";
import { resolveLiquidFillValue } from "./liquidFillEncoding";

describe("resolveLiquidFillValue", () => {
  it("reads value from props when provided", () => {
    expect(resolveLiquidFillValue([], { value: 0.72 })).toBe(0.72);
  });

  it("reads value from first row via encoding field", () => {
    expect(
      resolveLiquidFillValue([{ level: 72 }], {}, { value: { field: "level" } }),
    ).toBe(72);
  });

  it("defaults to zero when no data", () => {
    expect(resolveLiquidFillValue([], {})).toBe(0);
  });
});
