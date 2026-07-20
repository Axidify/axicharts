import { describe, expect, it } from "vitest";
import { getInteractionChrome, shouldShowCartesianLegend } from "./mode";

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

describe("shouldShowCartesianLegend", () => {
  it("shows legends for multi-series static dashboard panels", () => {
    expect(
      shouldShowCartesianLegend({ mode: "static", seriesCount: 2, compact: false }),
    ).toBe(true);
    expect(
      shouldShowCartesianLegend({ mode: "static", seriesCount: 1, compact: false }),
    ).toBe(false);
  });

  it("hides legends in live mode and compact sparkline heights", () => {
    expect(
      shouldShowCartesianLegend({ mode: "live", seriesCount: 2, compact: false }),
    ).toBe(false);
    expect(
      shouldShowCartesianLegend({ mode: "static", seriesCount: 2, compact: true }),
    ).toBe(false);
  });
});
