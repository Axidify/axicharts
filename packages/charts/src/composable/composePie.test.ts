import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { composePieMarks } from "./composePie";
import { Cell, Pie } from "./marks";

const DATA = [
  { name: "Product", value: 48 },
  { name: "Services", value: 28 },
  { name: "Support", value: 14 },
];

describe("composePieMarks", () => {
  it("builds slices from pie mark keys and config labels", () => {
    const composed = composePieMarks(
      [
        createElement(Pie, {
          dataKey: "value",
          nameKey: "name",
          innerRadius: 42,
          showLabels: true,
        }),
      ],
      DATA,
      {
        Product: { label: "Product revenue" },
      },
    );

    expect(composed.innerRadius).toBe(42);
    expect(composed.showLabels).toBe(true);
    expect(composed.slices).toEqual([
      { name: "Product revenue", value: 48 },
      { name: "Services", value: 28 },
      { name: "Support", value: 14 },
    ]);
  });

  it("applies cell tones by slice name", () => {
    const composed = composePieMarks(
      [
        createElement(
          Pie,
          { dataKey: "value", nameKey: "name" },
          createElement(Cell, { dataKey: "Support", tone: "warning" }),
        ),
      ],
      DATA,
      undefined,
    );

    expect(composed.slices[2]).toMatchObject({
      name: "Support",
      value: 14,
      tone: "warning",
    });
  });
});
