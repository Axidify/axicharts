import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { BarChart, CartesianChart } from "@axicharts/charts";
import { compilePanel } from "./compilePanel";
import { ejectBlocksComposableBody } from "./ejectBlocks";
import type { PanelSpec } from "./types";

const rows = [
  { week: "W1", revenue: 1200, target: 1000 },
  { week: "W2", revenue: 1800, target: 1400 },
];

/** Depth-first search of a compiled element tree for a component type. */
function findElement(node: ReactNode, type: unknown): ReactElement | undefined {
  if (!isValidElement(node)) return undefined;
  if (node.type === type) return node;
  const children = (node.props as { children?: ReactNode }).children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = findElement(child, type);
    if (found) return found;
  }
  return undefined;
}

const valueAxis = { valueFormat: "compact", yDomain: [0, "auto"] as [number, "auto"], yTickCount: 4 };

describe("panel valueFormat / yDomain / yTickCount", () => {
  it("reach cartesian charts", () => {
    const spec: PanelSpec = {
      type: "cartesian",
      encoding: { x: { field: "week" } },
      marks: [
        { type: "bar", field: "revenue" },
        { type: "line", field: "target" },
      ],
      ...valueAxis,
    };
    const chart = findElement(compilePanel(spec, rows), CartesianChart);
    expect(chart?.props).toMatchObject(valueAxis);
  });

  it("reach legacy bar panels", () => {
    const spec: PanelSpec = {
      type: "bar",
      props: { categories: ["W1", "W2"], series: [{ name: "Revenue", data: [1200, 1800] }] },
      ...valueAxis,
    };
    const chart = findElement(compilePanel(spec, []), BarChart);
    expect(chart?.props).toMatchObject(valueAxis);
  });

  it("are omitted when unset", () => {
    const spec: PanelSpec = {
      type: "cartesian",
      encoding: { x: { field: "week" } },
      marks: [{ type: "line", field: "revenue" }],
    };
    const props = findElement(compilePanel(spec, rows), CartesianChart)?.props as Record<string, unknown>;
    expect(props).not.toHaveProperty("valueFormat");
    expect(props).not.toHaveProperty("yDomain");
  });

  it("eject as JSX props", () => {
    const jsx = ejectBlocksComposableBody(
      {
        type: "cartesian",
        encoding: { x: { field: "week" } },
        marks: [{ type: "line", field: "revenue" }],
        ...valueAxis,
      },
      "rows",
    );
    expect(jsx).toContain('valueFormat="compact"');
    expect(jsx).toContain('yDomain={[0,"auto"]}');
    expect(jsx).toContain("yTickCount={4}");
  });
});
