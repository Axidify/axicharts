import { describe, expect, it } from "vitest";
import { cleanTheme, liveTheme } from "./themes";
import {
  defaultChartThemeHover,
  resolveHoverChrome,
  resolveHoverTokens,
  resolvePluginHoverPalette,
} from "./hover";

describe("hover tokens", () => {
  it("resolves shared dim opacity defaults", () => {
    expect(resolveHoverTokens(cleanTheme)).toEqual(defaultChartThemeHover);
  });

  it("resolves light and dark band chrome from theme name", () => {
    expect(resolveHoverChrome(cleanTheme).stroke).toBe("#2563eb");
    expect(resolveHoverChrome(liveTheme).stroke).toBe("#38bdf8");
  });

  it("resolves plugin hover palette from surface", () => {
    expect(resolvePluginHoverPalette("light").hoverStroke).toBe("#2563eb");
    expect(resolvePluginHoverPalette("dark").taskDimOpacity).toBe(0.45);
  });
});
