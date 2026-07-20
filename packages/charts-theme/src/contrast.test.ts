import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  isAcceptableChromeColor,
  looksLikeRgbInHsl,
  parseRgbString,
  resolveCanvasRgb,
} from "./contrast";

describe("contrast", () => {
  it("parses hex and rgb strings", () => {
    expect(parseRgbString("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseRgbString("rgb(100, 120, 140)")).toEqual({
      r: 100,
      g: 120,
      b: 140,
    });
  });

  it("computes higher contrast for dark text on white than faint pink", () => {
    const white = { r: 255, g: 255, b: 255 };
    const slate = { r: 100, g: 116, b: 139 };
    const faintPink = { r: 251, g: 207, b: 232 };

    expect(contrastRatio(slate, white)).toBeGreaterThan(4.5);
    expect(contrastRatio(faintPink, white)).toBeLessThan(2);
    expect(contrastRatio(slate, white)).toBeGreaterThan(
      contrastRatio(faintPink, white),
    );
  });

  it("detects RGB values stuffed into hsl()", () => {
    expect(looksLikeRgbInHsl("hsl(226 232 240 / .95)")).toBe(true);
    expect(looksLikeRgbInHsl("hsl(100 116 139)")).toBe(true);
    expect(looksLikeRgbInHsl("hsl(214 32% 91%)")).toBe(false);
  });

  it("rejects malformed hsl chrome tokens (yellow grid class bug)", () => {
    expect(
      isAcceptableChromeColor(
        "hsl(226 232 240 / .95)",
        "grid",
        { r: 255, g: 255, b: 255 },
      ),
    ).toBe(false);
    expect(
      isAcceptableChromeColor(
        "hsl(100 116 139)",
        "axis",
        { r: 255, g: 255, b: 255 },
      ),
    ).toBe(false);
  });
});
