import { clearChartTypes } from "@axicharts/charts/registry";
import { describe, expect, it } from "vitest";
import { compilePanel } from "./compilePanel";

describe("plugin panel types", () => {
  it("names the plugin package when a plugin type is not registered", () => {
    clearChartTypes();
    expect(() =>
      compilePanel({ type: "sankey", title: "Flow" }, { nodes: [], links: [] }),
    ).toThrow(/@axicharts\/charts-sankey\/register/);
  });

  it("keeps the generic error for unknown types", () => {
    clearChartTypes();
    expect(() =>
      compilePanel({ type: "not-a-chart" } as never, []),
    ).toThrow("Unsupported panel type: not-a-chart");
  });
});
