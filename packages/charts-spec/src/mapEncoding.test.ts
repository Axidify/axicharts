import { describe, expect, it } from "vitest";
import { mapDrillEjectProps, resolveMapDrillProps } from "./mapEncoding";

describe("mapEncoding", () => {
  it("resolves drill props from panel spec", () => {
    const hierarchy = {
      levels: [{ objectKey: "regions" }, { objectKey: "states", parentIdKey: "region" }],
    };
    expect(
      resolveMapDrillProps({
        drilldown: true,
        hierarchy,
        drillPath: ["west"],
        drillLabels: ["West"],
      }),
    ).toEqual({
      drilldown: true,
      hierarchy,
      drillPath: ["west"],
      drillLabels: ["West"],
    });
  });

  it("emits drill props for eject", () => {
    const jsx = mapDrillEjectProps({
      drilldown: true,
      hierarchy: { levels: [{ objectKey: "regions" }] },
      drillPath: ["west"],
      drillLabels: ["West"],
    });
    expect(jsx).toContain("drilldown");
    expect(jsx).toContain("hierarchy=");
    expect(jsx).toContain('drillPath={["west"]}');
    expect(jsx).toContain('drillLabels={["West"]}');
  });
});
