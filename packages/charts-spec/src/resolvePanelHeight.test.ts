import { describe, expect, it } from "vitest";
import { panelChartHeight, resolvePanelHeight } from "./resolvePanelHeight";

describe("resolvePanelHeight", () => {
  it("keeps sparkline and KPI heights below the plot minimum", () => {
    expect(resolvePanelHeight("bar", 60)).toBe(60);
    expect(resolvePanelHeight("stat", 72)).toBe(72);
  });

  it("enforces plot minimums for dashboard panels", () => {
    expect(resolvePanelHeight("bar", 200)).toBe(200);
    expect(resolvePanelHeight("bar", 120)).toBe(160);
    expect(resolvePanelHeight("scatter", 180)).toBe(200);
    expect(resolvePanelHeight("table", 100)).toBe(120);
  });

  it("uses fallback when height is omitted", () => {
    expect(resolvePanelHeight("line")).toBe(240);
    expect(resolvePanelHeight("pie", undefined, 280)).toBe(280);
  });
});

describe("panelChartHeight", () => {
  it("subtracts title chrome for titled panels at dashboard height", () => {
    expect(panelChartHeight("bar", 280, true)).toBe(257);
    expect(panelChartHeight("bar", 280, false)).toBe(280);
  });

  it("does not subtract title chrome for sparkline heights", () => {
    expect(panelChartHeight("bar", 60, true)).toBe(60);
  });
});
