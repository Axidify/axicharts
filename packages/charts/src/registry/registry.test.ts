import { afterEach, describe, expect, it } from "vitest";
import {
  clearChartTypes,
  getChartType,
  listChartTypes,
  registerChartType,
} from "./registry";

function DummyChart() {
  return null;
}

describe("registerChartType", () => {
  afterEach(() => {
    clearChartTypes();
  });

  it("registers and retrieves a chart type", () => {
    registerChartType({ type: "waterfall", Chart: DummyChart });
    expect(getChartType("waterfall")?.Chart).toBe(DummyChart);
    expect(listChartTypes()).toEqual(["waterfall"]);
  });

  it("rejects duplicate registrations", () => {
    registerChartType({ type: "gauge", Chart: DummyChart });
    expect(() =>
      registerChartType({ type: "gauge", Chart: DummyChart }),
    ).toThrow(/already registered/);
  });

  it("rejects empty type names", () => {
    expect(() => registerChartType({ type: "  ", Chart: DummyChart })).toThrow(
      /type is required/,
    );
  });
});
