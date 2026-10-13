import { describe, expect, it } from "vitest";
import { createTheme } from "./createTheme";
import { cleanTheme } from "./themes";
import { resolveThemeFont, themeFont } from "./typography";

describe("theme typography", () => {
  it("defaults to the historical 11px system fonts", () => {
    expect(themeFont(cleanTheme)).toBe("11px ui-sans-serif, system-ui, -apple-system, sans-serif");
    expect(themeFont(cleanTheme, { mono: true })).toBe("11px ui-monospace, SFMono-Regular, Menlo, monospace");
    expect(themeFont(cleanTheme, { delta: -1, weight: 600 })).toBe(
      "600 10px ui-sans-serif, system-ui, -apple-system, sans-serif",
    );
  });

  it("uses brand fonts and sizes, merged by createTheme", () => {
    const brand = createTheme(cleanTheme, { name: "brand", font: { family: "Inter, sans-serif", size: 13 } });
    expect(themeFont(brand)).toBe("13px Inter, sans-serif");
    expect(themeFont(brand, { delta: -1 })).toBe("12px Inter, sans-serif");
    expect(resolveThemeFont(brand).monoFamily).toContain("monospace");
    const tv = createTheme(brand, { name: "tv", font: { size: 18 } });
    expect(resolveThemeFont(tv)).toMatchObject({ family: "Inter, sans-serif", size: 18 });
  });
});
