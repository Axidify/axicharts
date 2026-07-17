import { describe, expect, it } from "vitest";
import { formatTick, registerTickFormat, unregisterTickFormat } from "./formatters";

describe("formatTick", () => {
  it("formats currency", () => {
    expect(formatTick(1284000, "currency")).toBe("$1,284,000");
  });

  it("formats percent", () => {
    expect(formatTick(12.4, "percent")).toBe("12.4%");
  });

  it("supports custom registrations", () => {
    registerTickFormat("lots", (v) => `${v} lots`);
    expect(formatTick(42, "lots")).toBe("42 lots");
    unregisterTickFormat("lots");
  });
});
