import { describe, expect, it } from "vitest";
import { ejectSizeProp } from "./ejectSizeEncoding";

describe("ejectSizeEncoding", () => {
  it("emits bar size prop expression", () => {
    const prop = ejectSizeProp(
      {
        type: "bar",
        encoding: {
          size: { field: "volume", type: "quantitative" },
        },
      },
      "rows",
      "volume",
    );
    expect(prop).toContain("size={resolveSizeMark");
    expect(prop).toContain('row.volume');
    expect(prop).toContain('"bar"');
  });

  it("emits line radius prop with custom range", () => {
    const prop = ejectSizeProp(
      {
        type: "line",
        encoding: {
          size: { field: "weight", range: [4, 12] },
        },
      },
      "rows",
      "weight",
    );
    expect(prop).toContain("radius={resolveSizeMark");
    expect(prop).toContain("[4,12]");
    expect(prop).toContain('"point"');
  });
});
