import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { getChartType, registerBuiltinChartTypes } from "@axicharts/charts/registry";
import { AndonBoard, SAMPLE_ANDON_STATIONS } from "./AndonBoard";
import { registerAndonChart } from "./registerCore";

describe("AndonBoard", () => {
  it("renders station labels and fault detail", () => {
    render(<AndonBoard stations={SAMPLE_ANDON_STATIONS.slice(4, 6)} columns={2} />);
    expect(screen.getByText("Inspector")).toBeTruthy();
    expect(screen.getByText("Reject high")).toBeTruthy();
    expect(screen.getByText("Palletizer")).toBeTruthy();
  });
});

describe("registerAndonChart", () => {
  it("registers andon type in chart registry", () => {
    registerBuiltinChartTypes();
    registerAndonChart();
    expect(getChartType("andon")?.defaultRenderer).toBe("svg");
  });
});
