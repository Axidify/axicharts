import { describe, expect, it } from "vitest";
import { studioTheme } from "./themes";

describe("studioTheme", () => {
  it("exports editorial SVG polish flags", () => {
    expect(studioTheme.name).toBe("studio");
    expect(studioTheme.svg).toEqual({
      areaGradient: true,
      barHighlight: true,
      softGrid: true,
      lineGlow: true,
    });
    expect(studioTheme.bar.radius).toBeGreaterThan(5);
  });
});
