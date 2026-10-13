import { describe, expect, it } from "vitest";
import { mapDrillEjectProps } from "./mapEncoding";

describe("mapEncoding", () => {
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
