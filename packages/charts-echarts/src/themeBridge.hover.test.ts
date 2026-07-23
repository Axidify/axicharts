import { describe, expect, it } from "vitest";
import { cleanTheme, presentationTheme } from "@axicharts/charts-theme";
import { itemEmphasisOptions } from "./themeBridge";

describe("itemEmphasisOptions", () => {
  it("dims siblings without scale in interactive mode", () => {
    expect(itemEmphasisOptions(cleanTheme)).toEqual({
      focus: "self",
      scale: false,
      itemStyle: {
        shadowBlur: 4,
        shadowOffsetX: 0,
        shadowColor: "rgba(15, 23, 42, 0.08)",
      },
    });
  });

  it("enables presentation scale", () => {
    expect(itemEmphasisOptions(presentationTheme, { presentation: true }).scale).toBe(
      true,
    );
    expect(
      itemEmphasisOptions(presentationTheme, { presentation: true }).scaleSize,
    ).toBe(6);
  });
});
