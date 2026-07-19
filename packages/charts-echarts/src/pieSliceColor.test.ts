import { describe, expect, it } from "vitest";
import { cleanTheme } from "@axicharts/charts-theme";
import { resolvePieSliceColor } from "./pieSliceColor";
import { seriesPalette } from "./themeBridge";

const PALETTE = seriesPalette(cleanTheme);

describe("resolvePieSliceColor", () => {
  it("cycles palette colors when tone is unset", () => {
    const slices = [
      { name: "Enterprise", value: 58 },
      { name: "Mid-market", value: 27 },
      { name: "SMB", value: 15 },
    ];

    const colors = slices.map((slice, index) =>
      resolvePieSliceColor(slice, index, PALETTE, cleanTheme),
    );

    expect(colors[0]).toBe(PALETTE[0]);
    expect(colors[1]).toBe(PALETTE[1]);
    expect(colors[2]).toBe(PALETTE[2]);
    expect(new Set(colors).size).toBe(3);
  });

  it("honors explicit slice color", () => {
    expect(
      resolvePieSliceColor(
        { name: "A", value: 1, color: "#ff00ff" },
        0,
        PALETTE,
        cleanTheme,
      ),
    ).toBe("#ff00ff");
  });

  it("honors explicit tone over palette index", () => {
    expect(
      resolvePieSliceColor(
        { name: "A", value: 1, tone: "critical" },
        0,
        PALETTE,
        cleanTheme,
      ),
    ).not.toBe(PALETTE[0]);
  });
});
