import { describe, expect, it } from "vitest";
import {
  legendHeightForVariant,
  legendItemStyle,
  tooltipSurfaceStyle,
} from "./chromeVariants";

describe("chromeVariants", () => {
  it("sizes legend rows per variant", () => {
    expect(legendHeightForVariant("pill")).toBe(28);
    expect(legendHeightForVariant("inline")).toBe(24);
    expect(legendHeightForVariant("compact")).toBe(22);
  });

  it("styles inline legend without pill chrome", () => {
    const style = legendItemStyle("inline", false);
    expect(style.background).toBeUndefined();
    expect(style.border).toBeUndefined();
  });

  it("styles minimal tooltips without blur", () => {
    const style = tooltipSurfaceStyle("minimal", false);
    expect(style.backdropFilter).toBeUndefined();
    expect(style.padding).toBe("6px 8px");
  });
});
