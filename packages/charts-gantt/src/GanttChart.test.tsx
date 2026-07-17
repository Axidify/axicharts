import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChartContainer } from "@axicharts/charts";
import { registerBuiltinChartTypes } from "@axicharts/charts/registry";
import { getChartType } from "@axicharts/charts/registry";
import { GanttChart } from "./GanttChart";
import { registerGanttChart } from "./registerCore";

describe("GanttChart", () => {
  it("renders task rows", () => {
    render(
      <ChartContainer height={180} width={480}>
        <GanttChart
          tasks={[
            { name: "Design", start: 0, end: 5 },
            { name: "Build", start: 4, end: 12 },
          ]}
        />
      </ChartContainer>,
    );
    expect(screen.getByRole("img", { name: /2 tasks/i })).toBeTruthy();
  });
});

describe("registerGanttChart", () => {
  it("registers gantt type", () => {
    registerBuiltinChartTypes();
    registerGanttChart();
    expect(getChartType("gantt")?.defaultRenderer).toBe("svg");
  });
});
