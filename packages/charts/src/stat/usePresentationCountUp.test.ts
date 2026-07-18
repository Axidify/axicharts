import { describe, expect, it } from "vitest";
import { parseCountUpValue, formatCountUpValue } from "./usePresentationCountUp";

describe("presentation count-up", () => {
  it("parses prefixed numeric values", () => {
    expect(parseCountUpValue("62.4%")).toEqual({
      prefix: "",
      target: 62.4,
      suffix: "%",
      decimals: 1,
    });
  });

  it("formats animated values with suffix", () => {
    const parsed = parseCountUpValue("$1,330")!;
    expect(formatCountUpValue(665, parsed)).toBe("$665");
  });
});

describe("presentation numeric count-up", () => {
  it("parses currency values with commas", () => {
    expect(parseCountUpValue("$1,330")?.target).toBe(1330);
  });
});
