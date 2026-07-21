import { describe, expect, it } from "vitest";
import { buildCartesianA11yDescriptor } from "./cartesianDescriptor";
import { buildPieA11yDescriptor } from "./echartsDescriptor";
import {
  buildA11yNavModel,
  getA11yNavPoint,
  getInitialA11yNavCursor,
  moveA11yNavCursor,
} from "./a11yNavigation";
import { resolveA11yDataTable, resolveA11yKeyboardNav } from "./a11yOptions";

describe("a11y navigation", () => {
  const descriptor = buildCartesianA11yDescriptor({
    chartType: "bar",
    categories: ["Mon", "Tue", "Wed"],
    series: [
      { name: "A", data: [10, 20, 30] },
      { name: "B", data: [11, 21, 31] },
    ],
  });
  const model = buildA11yNavModel(descriptor);

  it("builds a cartesian grid with row-major flat points", () => {
    expect(model.flatPoints).toHaveLength(6);
    expect(model.flatPoints[0]?.announcement).toBe("Mon, A, 10");
    expect(model.flatPoints[3]?.announcement).toBe("Mon, B, 11");
  });

  it("moves across categories in normal mode", () => {
    const start = getInitialA11yNavCursor(model)!;
    const next = moveA11yNavCursor(model, start, "ArrowRight", "normal");
    expect(getA11yNavPoint(model, next)?.announcement).toBe("Tue, A, 20");
  });

  it("moves across series in normal mode", () => {
    const start = getInitialA11yNavCursor(model)!;
    const next = moveA11yNavCursor(model, start, "ArrowDown", "normal");
    expect(getA11yNavPoint(model, next)?.announcement).toBe("Mon, B, 11");
  });

  it("serializes all points in serialize mode", () => {
    const start = getInitialA11yNavCursor(model)!;
    const next = moveA11yNavCursor(model, start, "ArrowDown", "serialize");
    expect(getA11yNavPoint(model, next)?.announcement).toBe("Tue, A, 20");
  });

  it("builds flat navigation for pie charts", () => {
    const pie = buildPieA11yDescriptor({
      slices: [
        { name: "Desktop", value: 60 },
        { name: "Mobile", value: 40 },
      ],
    });
    const pieModel = buildA11yNavModel(pie);
    expect(pieModel.flatPoints).toHaveLength(2);
    expect(pieModel.flatPoints[1]?.announcement).toContain("Mobile");
  });
});

describe("a11y options", () => {
  it("defaults keyboard navigation off", () => {
    expect(resolveA11yKeyboardNav()).toEqual({ enabled: false, mode: "normal" });
  });

  it("resolves data table toggle", () => {
    expect(resolveA11yDataTable(true)).toEqual({
      showToggle: true,
      visible: false,
    });
    expect(resolveA11yDataTable({ visible: true })).toEqual({
      showToggle: true,
      visible: true,
    });
  });
});
