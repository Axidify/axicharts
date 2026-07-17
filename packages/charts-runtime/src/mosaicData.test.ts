import { describe, expect, it } from "vitest";
import { mergeMosaicData, pluckMosaicData } from "./mosaicData";

describe("mosaicData", () => {
  it("plucks nested cell payloads by dot path", () => {
    const root = {
      finance: { kpis: [{ value: "$1M", label: "Revenue" }] },
      ops: { categories: ["Mon"], cells: [] },
    };

    expect(pluckMosaicData(root, "finance")).toEqual({
      kpis: [{ value: "$1M", label: "Revenue" }],
    });
  });

  it("merges layered mosaic data", () => {
    expect(
      mergeMosaicData({ categories: ["Mon"] }, { cells: [{ title: "CPU", data: [1] }] }),
    ).toEqual({
      categories: ["Mon"],
      cells: [{ title: "CPU", data: [1] }],
    });
  });
});
