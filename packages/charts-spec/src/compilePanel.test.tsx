import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { registerBuiltinChartTypes } from "@axicharts/charts/registry";
import { registerTankChart } from "@axicharts/charts-tank";
import { compilePanel } from "./compilePanel";

describe("compilePanel registered types", () => {
  it("compiles community plugin panels via registerChartType", () => {
    registerBuiltinChartTypes();
    registerTankChart();

    const panel = compilePanel(
      {
        type: "tank",
        props: { level: 72, label: "Tank 7", warningAt: 75 },
        theme: "industrial",
        height: 200,
        width: 140,
      },
      {},
    );

    const { container } = render(panel);
    expect(container.textContent).toContain("Tank 7");
    expect(container.textContent).toContain("72%");
  });
});

describe("compilePanel table", () => {
  it("renders tabular rows from spec data", () => {
    const panel = compilePanel(
      {
        type: "table",
        props: {
          columns: [
            { key: "symbol", label: "Symbol" },
            { key: "qty", label: "Qty", align: "right" },
          ],
        },
      },
      [{ symbol: "AAPL", qty: 100 }],
    );

    const { container } = render(panel);
    expect(container.textContent).toContain("Symbol");
    expect(container.textContent).toContain("AAPL");
    expect(container.textContent).toContain("100");
  });
});
