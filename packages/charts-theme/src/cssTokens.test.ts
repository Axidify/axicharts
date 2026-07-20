import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  readCssChartTokens,
  resolveChartPalette,
  resolveThemeTokens,
  resolveToneColors,
} from "./cssTokens";
import { cleanTheme } from "./themes";

describe("cssTokens", () => {
  const previous = new Map<string, string>();

  beforeEach(() => {
    for (const name of [
      "--chart-1",
      "--chart-2",
      "--chart-grid",
      "--chart-axis",
    ]) {
      previous.set(name, document.documentElement.style.getPropertyValue(name));
    }

    document.documentElement.style.setProperty("--chart-1", "221 83% 53%");
    document.documentElement.style.setProperty("--chart-2", "188 94% 35%");
    document.documentElement.style.setProperty(
      "--chart-grid",
      "hsl(214 32% 91% / 0.95)",
    );
    document.documentElement.style.setProperty("--chart-axis", "hsl(215 16% 47%)");
  });

  afterEach(() => {
    for (const [name, value] of previous.entries()) {
      if (value) {
        document.documentElement.style.setProperty(name, value);
      } else {
        document.documentElement.style.removeProperty(name);
      }
    }
  });

  it("reads palette and chrome vars from the document root", () => {
    const tokens = readCssChartTokens();
    expect(tokens?.palette[0]).toBe("hsl(221 83% 53%)");
    expect(tokens?.palette[1]).toBe("hsl(188 94% 35%)");
    expect(tokens?.grid).toContain("214");
    expect(tokens?.axis).toContain("215");
  });

  it("merges css tokens into a theme object", () => {
    const resolved = resolveThemeTokens(cleanTheme);
    expect(resolved.tokens?.palette[0]).toBe("hsl(221 83% 53%)");
    expect(resolveChartPalette(resolved)[0]).toBe("hsl(221 83% 53%)");
    expect(resolveToneColors(resolved).info).toBe("hsl(188 94% 35%)");
  });

  it("falls back to readable chrome when host axis token has poor contrast", () => {
    document.documentElement.style.setProperty(
      "--chart-axis",
      "hsl(330 80% 90%)",
    );

    const resolved = resolveThemeTokens(cleanTheme);
    expect(resolved.tokens?.axis).toBe("#64748b");
  });

  it("rejects RGB channels mislabeled as hsl (Project Desk malformed tokens)", () => {
    document.documentElement.style.setProperty(
      "--chart-grid",
      "hsl(226 232 240 / .95)",
    );
    document.documentElement.style.setProperty(
      "--chart-axis",
      "hsl(100 116 139)",
    );

    const resolved = resolveThemeTokens(cleanTheme);
    expect(resolved.tokens?.grid).toBe("rgba(226, 232, 240, 0.95)");
    expect(resolved.tokens?.axis).toBe("#64748b");
  });

  it("keeps explicit theme chrome over malformed host css tokens", () => {
    document.documentElement.style.setProperty(
      "--chart-grid",
      "hsl(226 232 240 / .95)",
    );
    document.documentElement.style.setProperty(
      "--chart-axis",
      "hsl(100 116 139)",
    );

    const resolved = resolveThemeTokens({
      ...cleanTheme,
      tokens: {
        palette: ["#4f46e5"],
        grid: "rgba(226, 232, 240, 0.35)",
        axis: "#64748b",
      },
    });

    expect(resolved.tokens?.grid).toBe("rgb(226, 232, 240)");
    expect(resolved.tokens?.axis).toBe("rgb(100, 116, 139)");
  });
});
