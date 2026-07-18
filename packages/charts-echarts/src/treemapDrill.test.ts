import { describe, expect, it } from "vitest";
import {
  buildTreemapDrillOptions,
  treePathToDrillPath,
} from "./treemapDrill";

describe("treePathToDrillPath", () => {
  it("maps ECharts treePathInfo to breadcrumb path", () => {
    expect(
      treePathToDrillPath([
        { name: "Cloud" },
        { name: "Compute" },
        { name: "EC2" },
      ]),
    ).toEqual(["Cloud", "Compute", "EC2"]);
  });

  it("filters unnamed nodes", () => {
    expect(treePathToDrillPath([{ name: "Root" }, {}, { name: "Leaf" }])).toEqual(
      ["Root", "Leaf"],
    );
  });
});

describe("buildTreemapDrillOptions", () => {
  it("disables drilldown by default", () => {
    expect(buildTreemapDrillOptions({ drilldown: false })).toEqual({
      nodeClick: false,
      breadcrumb: { show: false },
    });
  });

  it("enables zoom and breadcrumb when drilldown is on", () => {
    const options = buildTreemapDrillOptions({ drilldown: true });
    expect(options.nodeClick).toBe("zoomToNode");
    expect(options.breadcrumb.show).toBe(true);
  });
});
