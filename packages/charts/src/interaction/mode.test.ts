import { describe, expect, it } from "vitest";
import { getInteractionChrome } from "./mode";

describe("getInteractionChrome", () => {
  it("disables all chrome in static mode", () => {
    expect(getInteractionChrome("static")).toEqual({
      showTooltip: false,
      showLegend: false,
      showCrosshair: false,
    });
  });

  it("shows crosshair only in live mode", () => {
    expect(getInteractionChrome("live")).toEqual({
      showTooltip: false,
      showLegend: false,
      showCrosshair: true,
    });
  });

  it("enables full chrome in interactive mode", () => {
    expect(getInteractionChrome("interactive")).toEqual({
      showTooltip: true,
      showLegend: true,
      showCrosshair: true,
    });
  });

  it("enables full chrome in presentation mode", () => {
    expect(getInteractionChrome("presentation")).toEqual({
      showTooltip: true,
      showLegend: true,
      showCrosshair: true,
    });
  });
});
