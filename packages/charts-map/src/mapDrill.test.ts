import { describe, expect, it } from "vitest";
import {
  SAMPLE_US_HIERARCHY,
  SAMPLE_US_TOPOLOGY,
} from "./sampleData";
import {
  createMapDrillChange,
  drillIntoPath,
  drillToBreadcrumbIndex,
  extractTopologyFeatures,
  filterFeaturesForDrill,
  hasDrillableChildren,
  hasChildLevel,
  resolveActiveLevel,
  resolveVisibleMapFeatures,
} from "./mapDrill";

describe("map drill state machine", () => {
  it("starts at the first hierarchy level when drill path is empty", () => {
    const active = resolveActiveLevel(SAMPLE_US_HIERARCHY, []);
    expect(active?.level.objectKey).toBe("regions");
    expect(active?.levelIndex).toBe(0);
  });

  it("advances hierarchy level with drill path length", () => {
    expect(resolveActiveLevel(SAMPLE_US_HIERARCHY, ["west"])?.level.objectKey).toBe(
      "states",
    );
    expect(
      resolveActiveLevel(SAMPLE_US_HIERARCHY, ["west", "06"])?.level.objectKey,
    ).toBe("counties");
  });

  it("filters child features by parent drill segment", () => {
    const states = extractTopologyFeatures(SAMPLE_US_TOPOLOGY, "states");
    const westStates = filterFeaturesForDrill(
      states,
      1,
      SAMPLE_US_HIERARCHY.levels[1]!,
      ["west"],
    );
    expect(westStates.map((feature) => feature.properties?.name)).toEqual([
      "California",
      "Washington",
    ]);
  });

  it("detects drillable children for regions and states", () => {
    expect(
      hasDrillableChildren(SAMPLE_US_TOPOLOGY, SAMPLE_US_HIERARCHY, 0, "west"),
    ).toBe(true);
    expect(
      hasDrillableChildren(SAMPLE_US_TOPOLOGY, SAMPLE_US_HIERARCHY, 1, "06"),
    ).toBe(true);
    expect(
      hasDrillableChildren(SAMPLE_US_TOPOLOGY, SAMPLE_US_HIERARCHY, 1, "36"),
    ).toBe(false);
    expect(hasChildLevel(SAMPLE_US_HIERARCHY, 2)).toBe(false);
  });

  it("builds drill navigation paths", () => {
    expect(drillIntoPath([], [], "west", "West")).toEqual({
      path: ["west"],
      labels: ["West"],
    });
    expect(
      drillToBreadcrumbIndex(["west", "06"], ["West", "California"], 0),
    ).toEqual({
      path: ["west"],
      labels: ["West"],
    });
    expect(createMapDrillChange(["west"], ["West"]).level).toBe(1);
  });

  it("resolves visible features for each drill level", () => {
    const root = resolveVisibleMapFeatures({
      topology: SAMPLE_US_TOPOLOGY,
      hierarchy: SAMPLE_US_HIERARCHY,
      drillPath: [],
      objectKey: "states",
    });
    expect(root.features).toHaveLength(3);

    const states = resolveVisibleMapFeatures({
      topology: SAMPLE_US_TOPOLOGY,
      hierarchy: SAMPLE_US_HIERARCHY,
      drillPath: ["west"],
      objectKey: "states",
    });
    expect(states.features.map((feature) => feature.properties?.name)).toEqual([
      "California",
      "Washington",
    ]);

    const counties = resolveVisibleMapFeatures({
      topology: SAMPLE_US_TOPOLOGY,
      hierarchy: SAMPLE_US_HIERARCHY,
      drillPath: ["west", "06"],
      objectKey: "states",
    });
    expect(counties.features.map((feature) => feature.properties?.name)).toEqual([
      "Los Angeles",
      "San Francisco",
    ]);
  });
});
