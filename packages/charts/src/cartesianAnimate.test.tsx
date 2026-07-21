import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ChartContainer } from "./container/ChartContainer";
import { LineChart } from "./line/LineChart";
import { BarChart } from "./bar/BarChart";
import { cleanTheme } from "@axicharts/charts-theme";

const CATEGORIES = ["A", "B", "C"];
const SERIES = [{ name: "Value", data: [10, 20, 15] }];

describe("cartesian animate prop", () => {
  it("renders LineChart with animate enter", () => {
    const { container } = render(
      <ChartContainer theme={cleanTheme} width={320} height={180}>
        <LineChart
          categories={CATEGORIES}
          series={SERIES}
          animate="enter"
          renderer="svg"
        />
      </ChartContainer>,
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders BarChart with animate enter on canvas", () => {
    const { container } = render(
      <ChartContainer theme={cleanTheme} width={320} height={180}>
        <BarChart
          categories={CATEGORIES}
          series={SERIES}
          animate="enter"
        />
      </ChartContainer>,
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("renders LineChart with animate update in static mode", () => {
    const { container, rerender } = render(
      <ChartContainer theme={cleanTheme} width={320} height={180} mode="static">
        <LineChart
          categories={CATEGORIES}
          series={SERIES}
          animate="update"
          renderer="svg"
        />
      </ChartContainer>,
    );
    expect(container.querySelector("svg")).toBeTruthy();
    rerender(
      <ChartContainer theme={cleanTheme} width={320} height={180} mode="static">
        <LineChart
          categories={CATEGORIES}
          series={[{ name: "Value", data: [12, 18, 22] }]}
          animate="update"
          renderer="svg"
        />
      </ChartContainer>,
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
