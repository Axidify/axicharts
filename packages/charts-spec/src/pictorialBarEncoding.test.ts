import { describe, expect, it } from "vitest";
import { pictorialBarFromRows, resolvePictorialBarData } from "./pictorialBarEncoding";

describe("pictorialBarFromRows", () => {
  it("builds pictorial bar items from x + y encoding", () => {
    const rows = [
      { resource: "CPU", used: 72 },
      { resource: "Memory", used: 58 },
    ];

    expect(
      pictorialBarFromRows(rows, {
        x: { field: "resource" },
        y: { field: "used" },
      }),
    ).toEqual([
      { category: "CPU", value: 72, symbol: undefined, color: undefined, tone: undefined },
      { category: "Memory", value: 58, symbol: undefined, color: undefined, tone: undefined },
    ]);
  });

  it("supports category/value encoding aliases", () => {
    const rows = [{ name: "Battery", level: 84, symbol: "rect" }];

    expect(
      pictorialBarFromRows(rows, {
        category: { field: "name" },
        value: { field: "level" },
      }),
    ).toEqual([
      { category: "Battery", value: 84, symbol: "rect", color: undefined, tone: undefined },
    ]);
  });
});

describe("resolvePictorialBarData", () => {
  it("prefers props.data when provided", () => {
    const data = {
      items: [{ category: "Disk", value: 33 }],
      symbol: "triangle",
    };

    expect(resolvePictorialBarData([], { data }, undefined)).toEqual(data);
  });

  it("maps rows when data prop is absent", () => {
    expect(
      resolvePictorialBarData(
        [{ category: "Network", value: 19 }],
        { symbol: "roundRect" },
        { x: { field: "category" }, y: { field: "value" } },
      ),
    ).toEqual({
      items: [{ category: "Network", value: 19, symbol: undefined, color: undefined, tone: undefined }],
      symbol: "roundRect",
    });
  });
});
