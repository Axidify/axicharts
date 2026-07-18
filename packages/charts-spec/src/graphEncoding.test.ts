import { describe, expect, it } from "vitest";
import { graphFromRows } from "./graphEncoding";

describe("graphFromRows", () => {
  it("builds nodes and edges from long-form rows", () => {
    const rows = [
      { source: "api", target: "auth", rps: 120 },
      { source: "api", target: "orders", rps: 90 },
      { source: "orders", target: "payments", rps: 55 },
    ];

    const result = graphFromRows(rows, {}, {
      source: { field: "source" },
      target: { field: "target" },
      value: { field: "rps" },
    });

    expect(result.nodes.map((node) => node.id).sort()).toEqual([
      "api",
      "auth",
      "orders",
      "payments",
    ]);
    expect(result.edges).toEqual([
      { source: "api", target: "auth", value: 120 },
      { source: "api", target: "orders", value: 90 },
      { source: "orders", target: "payments", value: 55 },
    ]);
  });

  it("returns wide props when nodes and edges are provided", () => {
    const wide = {
      nodes: [{ id: "a", name: "A" }],
      edges: [{ source: "a", target: "b" }],
      categories: [{ name: "Core" }],
    };

    expect(graphFromRows([], wide)).toEqual(wide);
  });
});
