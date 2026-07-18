import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { feature } from "topojson-client";
import { geoPath, geoAlbersUsa } from "d3-geo";
import { getChartType, registerBuiltinChartTypes } from "@axicharts/charts/registry";
import {
  MapChart,
  SAMPLE_DRILL_VALUES,
  SAMPLE_US_HIERARCHY,
  SAMPLE_US_TOPOLOGY,
  SAMPLE_US_VALUES,
} from "./MapChart";
import { registerMapChart } from "./registerCore";

describe("MapChart", () => {
  it("renders region labels from topojson", () => {
    const { container } = render(
      <MapChart
        topology={SAMPLE_US_TOPOLOGY}
        values={SAMPLE_US_VALUES}
        showScale={false}
      />,
    );
    const svg = container.querySelector("svg");
    expect(svg?.textContent).toContain("California");
    expect(svg?.textContent).toContain("82");
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

  it("drills into child geography and shows breadcrumb", () => {
    const onDrillChange = vi.fn();
    const { container } = render(
      <MapChart
        topology={SAMPLE_US_TOPOLOGY}
        values={SAMPLE_DRILL_VALUES}
        hierarchy={SAMPLE_US_HIERARCHY}
        drilldown
        showScale={false}
        showLabels={false}
        onDrillChange={onDrillChange}
      />,
    );

    const west = [...container.querySelectorAll("g")].find(
      (node) => node.getAttribute("data-drillable") === "true",
    );
    expect(west).toBeTruthy();
    fireEvent.click(west!);

    expect(onDrillChange).toHaveBeenCalledWith({
      path: ["west"],
      labels: ["West"],
      level: 1,
    });
    expect(screen.getByTestId("map-breadcrumb-root")).toBeTruthy();
    expect(screen.getByText("West")).toBeTruthy();
  });

  it("supports controlled drill path", () => {
    const { container } = render(
      <MapChart
        topology={SAMPLE_US_TOPOLOGY}
        values={SAMPLE_DRILL_VALUES}
        hierarchy={SAMPLE_US_HIERARCHY}
        drilldown
        drillPath={["west"]}
        drillLabels={["West"]}
        showScale={false}
      />,
    );
    const svg = container.querySelector("svg");
    expect(svg?.textContent).toContain("California");
    expect(svg?.textContent).toContain("Washington");
    expect(svg?.textContent).not.toContain("Texas");
  });

  it("updates a11y table caption when drilled", () => {
    const { container } = render(
      <MapChart
        topology={SAMPLE_US_TOPOLOGY}
        values={SAMPLE_DRILL_VALUES}
        hierarchy={SAMPLE_US_HIERARCHY}
        drilldown
        drillPath={["west"]}
        drillLabels={["West"]}
        showScale={false}
      />,
    );
    expect(container.querySelector("caption")?.textContent).toContain("West");
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
