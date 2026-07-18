import { describe, expect, it } from "vitest";
import { flattenTreemapValues, mapTreemapData } from "./treemapData";
import type { TreemapNode } from "./treemapTypes";

describe("mapTreemapData", () => {
  it("maps leaf nodes with values and colors", () => {
    const nodes: TreemapNode[] = [
      { name: "Compute", value: 42, tone: "info" },
      { name: "Storage", value: 28 },
    ];
    const mapped = mapTreemapData(nodes);
    expect(mapped).toHaveLength(2);
    expect(mapped[0]?.value).toBe(42);
    expect(mapped[0]?.itemStyle?.color).toBe("#0891b2");
  });

  it("maps nested hierarchy", () => {
    const nodes: TreemapNode[] = [
      {
        name: "Cloud",
        children: [
          { name: "EC2", value: 30 },
          { name: "S3", value: 20 },
        ],
      },
    ];
    const mapped = mapTreemapData(nodes);
    expect(mapped[0]?.children).toHaveLength(2);
    expect(flattenTreemapValues(nodes)).toEqual([30, 20]);
  });
});
