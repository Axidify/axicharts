import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { getChartType, registerBuiltinChartTypes } from "@axicharts/charts/registry";
import { GeoMapChart, SAMPLE_GEO_REGIONS } from "./GeoMapChart";
import { registerGeoChart } from "./registerCore";

describe("GeoMapChart", () => {
  it("renders region labels", () => {
    render(<GeoMapChart regions={SAMPLE_GEO_REGIONS.slice(0, 1)} showScale={false} />);
    expect(screen.getByText("West")).toBeTruthy();
    expect(screen.getByText("72")).toBeTruthy();
  });

  it("highlights hovered region", () => {
    const { container } = render(
      <GeoMapChart regions={SAMPLE_GEO_REGIONS.slice(0, 1)} showScale={false} />,
    );
    const region = container.querySelector("g");
    expect(region).toBeTruthy();
    fireEvent.mouseEnter(region!);
    expect(container.querySelector('[stroke-width="2"]')).toBeTruthy();
  });

  it("renders dark surface palette", () => {
    const { container } = render(
      <GeoMapChart
        regions={SAMPLE_GEO_REGIONS.slice(0, 1)}
        surface="dark"
        showScale={false}
      />,
    );
    expect(container.querySelector('[fill="#0f172a"]')).toBeTruthy();
  });
});

describe("registerGeoChart", () => {
  it("registers geo type in chart registry", () => {
    registerBuiltinChartTypes();
    registerGeoChart();
    expect(getChartType("geo")?.defaultRenderer).toBe("svg");
  });
});
