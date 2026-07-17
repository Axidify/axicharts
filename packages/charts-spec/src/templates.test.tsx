import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { registerBuiltinChartTypes } from "@axicharts/charts/registry";
import { registerTankChart } from "@axicharts/charts-tank";
import { compileTemplate } from "./templates";

describe("pluginsWallTemplate", () => {
  it("compiles registered plugin panels from template data", () => {
    registerBuiltinChartTypes();
    registerTankChart();

    const view = compileTemplate("plugins-wall", {
      panels: [
        {
          type: "tank",
          theme: "industrial",
          height: 200,
          width: 140,
          props: { level: 55, label: "Tank 9" },
        },
      ],
    });

    const { container } = render(view);
    expect(container.textContent).toContain("Tank 9");
    expect(container.textContent).toContain("55%");
  });
});
