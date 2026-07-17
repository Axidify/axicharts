import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { getChartType, registerBuiltinChartTypes } from "@axicharts/charts/registry";
import { SankeyChart, SAMPLE_SANKEY_FLOW } from "./SankeyChart";
import { registerSankeyChart } from "./registerCore";

describe("SankeyChart", () => {
  it("renders chart root with aria label", () => {
    const { container } = render(
      <SankeyChart nodes={SAMPLE_SANKEY_FLOW.nodes} links={SAMPLE_SANKEY_FLOW.links} />,
    );
    expect(container.querySelector('[aria-label="Sankey flow diagram"]')).toBeTruthy();
  });
});

describe("registerSankeyChart", () => {
  it("registers sankey type in chart registry", () => {
    registerBuiltinChartTypes();
    registerSankeyChart();
    expect(getChartType("sankey")?.defaultRenderer).toBe("canvas");
  });
});
