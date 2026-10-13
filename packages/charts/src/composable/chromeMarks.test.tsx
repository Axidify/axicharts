import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { cleanTheme } from "@axicharts/charts-theme";
import { ChartContainer } from "../container/ChartContainer";
import { useChartLayout } from "../container/ChartLayoutContext";
import { LineChart } from "../line/LineChart";
import { Legend, Line, Tooltip, XAxis } from "./marks";
import { readChromeMarks } from "./readChromeMarks";

const rows = [
  { day: "Mon", api: 120, web: 80 },
  { day: "Tue", api: 140, web: 95 },
  { day: "Wed", api: 130, web: 90 },
];

function twoSeriesChart(extra: React.ReactNode) {
  return render(
    <ChartContainer theme={cleanTheme} width={480} height={260} mode="interactive">
      <LineChart data={rows}>
        <XAxis dataKey="day" />
        <Line dataKey="api" name="API" />
        <Line dataKey="web" name="Web" />
        {extra}
      </LineChart>
    </ChartContainer>,
  );
}

describe("composable <Tooltip> / <Legend>", () => {
  it("reads their props from children", () => {
    const formatter = (value: number) => `${value} ms`;
    const settings = readChromeMarks([
      <Line key="l" dataKey="api" />,
      <Tooltip key="t" variant="dense" formatter={formatter} />,
      <Legend key="g" hidden />,
    ]);
    expect(settings.tooltip).toEqual({ variant: "dense", formatter });
    expect(settings.legend).toEqual({ hidden: true });
  });

  it("shows the legend by default and hides it with <Legend hidden />", () => {
    const legend = (node: HTMLElement) => node.querySelector('[aria-label="Chart legend"]');
    expect(legend(twoSeriesChart(null).container)?.textContent).toContain("Web");
    expect(legend(twoSeriesChart(<Legend hidden />).container)).toBeNull();
  });

  it("is ignored by charts that aren't composable (no children)", () => {
    expect(readChromeMarks(undefined)).toEqual({});
  });
});

describe("chrome variant scope", () => {
  it("overrides the container's variants for the chart subtree only", async () => {
    const { ChartLayoutContext } = await import("../container/ChartLayoutContext");
    const { CartesianChartShell } = await import("../chrome/CartesianChartShell");
    const seen: Array<{ tooltip?: string; legend?: string }> = [];
    function Probe() {
      const layout = useChartLayout();
      seen.push({ tooltip: layout.tooltipVariant, legend: layout.legendVariant });
      return null;
    }
    render(
      <ChartContainer theme={cleanTheme} width={480} height={260} tooltipVariant="card" legendVariant="pill">
        <CartesianChartShell
          categories={["Mon"]}
          chromeSettings={{ tooltip: { variant: "dense" }, legend: { variant: "compact" } }}
          plot={<Probe />}
        />
        <ChartLayoutContext.Consumer>
          {(layout) => {
            seen.push({ tooltip: layout?.tooltipVariant, legend: layout?.legendVariant });
            return null;
          }}
        </ChartLayoutContext.Consumer>
      </ChartContainer>,
    );
    expect(seen).toContainEqual({ tooltip: "dense", legend: "compact" });
    expect(seen).toContainEqual({ tooltip: "card", legend: "pill" });
  });
});
