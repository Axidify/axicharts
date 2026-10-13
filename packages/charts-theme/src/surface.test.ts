import { describe, expect, it } from "vitest";
import { createTheme } from "./createTheme";
import { cleanTheme, industrialTheme, liveTheme, studioTheme } from "./themes";
import { isDarkTheme } from "./surface";
import { resolveHoverChrome } from "./hover";

describe("isDarkTheme", () => {
  it("knows the built-in surfaces", () => {
    expect(isDarkTheme(liveTheme)).toBe(true);
    expect(isDarkTheme(industrialTheme)).toBe(true);
    expect(isDarkTheme(cleanTheme)).toBe(false);
    expect(isDarkTheme(studioTheme)).toBe(false);
  });

  it("keeps createTheme forks of dark themes dark (name checks used to miss them)", () => {
    const brandDark = createTheme(liveTheme, { name: "acme-dark" });
    expect(brandDark.surface).toBe("dark");
    expect(isDarkTheme(brandDark)).toBe(true);
    expect(resolveHoverChrome(brandDark)).toEqual(resolveHoverChrome(liveTheme));
  });

  it("lets a light base opt into a dark surface", () => {
    expect(isDarkTheme(createTheme(cleanTheme, { name: "night", surface: "dark" }))).toBe(true);
  });

  it("falls back to names for themes without surface", () => {
    expect(isDarkTheme({ name: "live" })).toBe(true);
    expect(isDarkTheme({ name: "custom" })).toBe(false);
  });
});
