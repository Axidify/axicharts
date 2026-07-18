import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { clearChartTypes, getChartType } from "../registry/registry";
import { registerEChartsOptionChart } from "./registerCore";
import { EChartsOptionChart } from "./EChartsOptionChart";
import { ChartContainer } from "../container/ChartContainer";
import { cleanTheme } from "@axicharts/charts-theme";

describe("registerEChartsOptionChart", () => {
  it("registers the echarts escape hatch type", () => {
    clearChartTypes();
    registerEChartsOptionChart();

    const registration = getChartType("echarts");
    expect(registration?.type).toBe("echarts");
    expect(registration?.Chart).toBe(EChartsOptionChart);
    expect(registration?.defaultRenderer).toBe("canvas");
  });
});

describe("EChartsOptionChart shell", () => {
  it("renders inside ChartContainer", () => {
    const { container } = render(
      <ChartContainer theme={cleanTheme} height={240} width={360}>
        <EChartsOptionChart
          option={{
            series: [{ type: "bar", data: [4, 8, 2] }],
            xAxis: { type: "category", data: ["A", "B", "C"] },
            yAxis: { type: "value" },
          }}
        />
      </ChartContainer>,
    );

    expect(container.querySelector(".axicharts-echarts")).toBeTruthy();
  });
});
