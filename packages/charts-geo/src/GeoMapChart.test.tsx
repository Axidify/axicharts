import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { getChartType, registerBuiltinChartTypes } from "@axicharts/charts/registry";
import { GeoMapChart, SAMPLE_GEO_REGIONS } from "./GeoMapChart";
import { registerGeoChart } from "./registerCore";

describe("GeoMapChart", () => {
  it("renders region labels", () => {
    render(<GeoMapChart regions={SAMPLE_GEO_REGIONS.slice(0, 1)} />);
    expect(screen.getByText("West")).toBeTruthy();
    expect(screen.getByText("72")).toBeTruthy();
  });
});

describe("registerGeoChart", () => {
  it("registers geo type in chart registry", () => {
    registerBuiltinChartTypes();
    registerGeoChart();
    expect(getChartType("geo")?.defaultRenderer).toBe("svg");
  });
});
