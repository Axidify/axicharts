import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { feature } from "topojson-client";
import { geoPath, geoAlbersUsa } from "d3-geo";
import { getChartType, registerBuiltinChartTypes } from "@axicharts/charts/registry";
import {
  MapChart,
  SAMPLE_US_TOPOLOGY,
  SAMPLE_US_VALUES,
} from "./MapChart";
import { registerMapChart } from "./registerCore";

describe("MapChart", () => {
  it("renders region labels from topojson", () => {
    render(
      <MapChart
        topology={SAMPLE_US_TOPOLOGY}
        values={SAMPLE_US_VALUES}
        showScale={false}
      />,
    );
    expect(screen.getByText("California")).toBeTruthy();
    expect(screen.getByText("82")).toBeTruthy();
  });

  it("renders svg paths for topo features", () => {
    const { container } = render(
      <MapChart
        topology={SAMPLE_US_TOPOLOGY}
        values={SAMPLE_US_VALUES}
        showScale={false}
        showLabels={false}
      />,
    );
    expect(container.querySelectorAll("path").length).toBeGreaterThan(0);
  });

  it("highlights hovered region", () => {
    const { container } = render(
      <MapChart
        topology={SAMPLE_US_TOPOLOGY}
        values={SAMPLE_US_VALUES}
        showScale={false}
        showLabels={false}
      />,
    );
    const region = container.querySelector("g");
    expect(region).toBeTruthy();
    fireEvent.mouseEnter(region!);
    expect(container.querySelector('[stroke-width="1.5"]')).toBeTruthy();
  });

  it("renders dark surface palette", () => {
    const { container } = render(
      <MapChart
        topology={SAMPLE_US_TOPOLOGY}
        values={SAMPLE_US_VALUES}
        surface="dark"
        showScale={false}
        showLabels={false}
      />,
    );
    expect(container.querySelector('[fill="#0f172a"]')).toBeTruthy();
  });
});

describe("map path rendering", () => {
  it("projects topo features to valid svg path strings", () => {
    const collection = feature(
      SAMPLE_US_TOPOLOGY,
      SAMPLE_US_TOPOLOGY.objects.states,
    );
    const projection = geoAlbersUsa().fitSize([280, 160], collection);
    const path = geoPath(projection);
    for (const mapFeature of collection.features) {
      const d = path(mapFeature);
      expect(d).toBeTruthy();
      expect(d!.length).toBeGreaterThan(4);
    }
  });
});

describe("registerMapChart", () => {
  it("registers map type in chart registry", () => {
    registerBuiltinChartTypes();
    registerMapChart();
    expect(getChartType("map")?.defaultRenderer).toBe("svg");
  });
});
