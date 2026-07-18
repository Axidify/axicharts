import { describe, expect, it, beforeEach } from "vitest";
import {
  assertPanelCategoryEnabled,
  clearCategoryRegistration,
  isCategoryRegistered,
  listRegisteredCategories,
  registerCategory,
  resolvePanelCategory,
} from "./panelCategories";

describe("panel category registration", () => {
  beforeEach(() => {
    clearCategoryRegistration();
  });

  it("defaults to all categories enabled", () => {
    expect(isCategoryRegistered("cartesian")).toBe(true);
    expect(isCategoryRegistered("matrix")).toBe(true);
    expect(() => assertPanelCategoryEnabled("line")).not.toThrow();
    expect(() => assertPanelCategoryEnabled("heatmap")).not.toThrow();
  });

  it("scopes compilePanel to registered categories", () => {
    registerCategory("cartesian");

    expect(listRegisteredCategories()).toEqual(["cartesian"]);
    expect(isCategoryRegistered("cartesian")).toBe(true);
    expect(isCategoryRegistered("matrix")).toBe(false);
    expect(() => assertPanelCategoryEnabled("line")).not.toThrow();
    expect(() => assertPanelCategoryEnabled("heatmap")).toThrow(
      /requires category "matrix"/,
    );
  });

  it("always allows platform panel types", () => {
    registerCategory("kpi");

    expect(resolvePanelCategory("table")).toBe("platform");
    expect(() => assertPanelCategoryEnabled("table")).not.toThrow();
    expect(() => assertPanelCategoryEnabled("markdown")).not.toThrow();
  });

  it("maps panel types to taxonomy categories", () => {
    expect(resolvePanelCategory("combo")).toBe("cartesian");
    expect(resolvePanelCategory("donut")).toBe("distribution");
    expect(resolvePanelCategory("candlestick")).toBe("financial");
    expect(resolvePanelCategory("theme-river")).toBe("matrix");
    expect(resolvePanelCategory("gauge")).toBe("industrial");
    expect(resolvePanelCategory("stat")).toBe("kpi");
    expect(resolvePanelCategory("echarts")).toBe("platform");
  });
});
