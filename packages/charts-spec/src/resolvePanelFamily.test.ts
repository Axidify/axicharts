import { describe, expect, it } from "vitest";
import { resolvePanelFamily } from "./resolvePanelFamily";

describe("resolvePanelFamily", () => {
  it("maps cartesian-like types to cartesian", () => {
    expect(resolvePanelFamily({ type: "cartesian" })).toBe("cartesian");
    expect(resolvePanelFamily({ type: "blocks" })).toBe("cartesian");
    expect(resolvePanelFamily({ type: "line" })).toBe("cartesian");
    expect(resolvePanelFamily({ type: "combo" })).toBe("cartesian");
  });

  it("maps distribution type", () => {
    expect(resolvePanelFamily({ type: "distribution" })).toBe("distribution");
  });

  it("maps distribution legacy types", () => {
    expect(resolvePanelFamily({ type: "donut" })).toBe("distribution");
    expect(resolvePanelFamily({ type: "pie" })).toBe("distribution");
    expect(resolvePanelFamily({ type: "funnel" })).toBe("distribution");
  });

  it("maps matrix types", () => {
    expect(resolvePanelFamily({ type: "heatmap" })).toBe("matrix");
    expect(resolvePanelFamily({ type: "calendar-heatmap" })).toBe("matrix");
  });

  it("maps widgets to legacy", () => {
    expect(resolvePanelFamily({ type: "stat" })).toBe("legacy");
    expect(resolvePanelFamily({ type: "table" })).toBe("legacy");
    expect(resolvePanelFamily({ type: "gauge" })).toBe("legacy");
  });
});
