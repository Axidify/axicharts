import { afterEach, describe, expect, it } from "vitest";
import { clearTickFormats, registerTickFormat } from "./formatters";
import {
  applyYDomain,
  evenTicks,
  formatChartValue,
  resolveValueFormat,
} from "./valueFormat";

afterEach(() => clearTickFormats());

describe("formatChartValue", () => {
  it("keeps the historical default rounding", () => {
    expect(formatChartValue(1234.56)).toBe("1235");
    expect(formatChartValue(12.34, { suffix: " ms" })).toBe("12.3 ms");
  });

  it("applies built-in, registered and function formats, then the suffix", () => {
    expect(formatChartValue(1500, { format: "compact" })).toBe("1.5K");
    expect(formatChartValue(1500, { format: "compact", suffix: " req" })).toBe("1.5K req");
    registerTickFormat("kilo", (value) => `${value / 1000}k`);
    expect(formatChartValue(2000, { format: "kilo" })).toBe("2k");
    expect(formatChartValue(7, { format: (value) => `#${value}` })).toBe("#7");
  });
});

describe("resolveValueFormat", () => {
  it("is undefined when unset", () => {
    expect(resolveValueFormat(undefined)).toBeUndefined();
  });
});

describe("applyYDomain", () => {
  it("overrides fixed sides and keeps auto sides", () => {
    expect(applyYDomain([12, 88], [0, "auto"])).toEqual([0, 88]);
    expect(applyYDomain([12, 88], ["auto", 100])).toEqual([12, 100]);
    expect(applyYDomain([12, 88], undefined)).toEqual([12, 88]);
  });

  it("ignores an inverted domain", () => {
    expect(applyYDomain([12, 88], [100, 0])).toEqual([12, 88]);
  });
});

describe("evenTicks", () => {
  it("spaces ticks inclusively", () => {
    expect(evenTicks(0, 100, 5)).toEqual([0, 25, 50, 75, 100]);
    expect(evenTicks(0, 10, 1)).toEqual([0, 10]);
  });
});
