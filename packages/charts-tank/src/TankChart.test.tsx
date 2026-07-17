import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { getChartType } from "@axicharts/charts/registry";
import { registerBuiltinChartTypes } from "@axicharts/charts/registry";
import { TankChart } from "./TankChart";
import { registerTankChart } from "./registerCore";

describe("TankChart", () => {
  it("renders level label", () => {
    render(<TankChart level={72} label="Tank A" />);
    expect(screen.getByRole("img", { name: "Tank A: 72%" })).toBeTruthy();
  });
});

describe("registerTankChart", () => {
  it("registers tank type in chart registry", () => {
    registerBuiltinChartTypes();
    registerTankChart();
    expect(getChartType("tank")?.defaultRenderer).toBe("svg");
  });
});
