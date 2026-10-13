import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { cleanTheme } from "@axicharts/charts-theme";

const plotProps: Record<string, Record<string, unknown>[]> = { line: [], bar: [], combo: [] };

vi.mock("@axicharts/charts-canvas", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@axicharts/charts-canvas")>();
  const capture = (key: string) => (props: Record<string, unknown>) => {
    plotProps[key]!.push(props);
    return null;
  };
  return {
    ...actual,
    UPlotLine: capture("line"),
    UPlotBar: capture("bar"),
    UPlotCombo: capture("combo"),
  };
});

import { ChartContainer } from "./container/ChartContainer";
import { LineChart } from "./line/LineChart";
import { BarChart } from "./bar/BarChart";
import { CartesianChart } from "./cartesian/CartesianChart";
import { Bar, Line, XAxis, YAxis } from "./composable/marks";
import { useResolvedCartesianProps } from "./composable/resolveCartesianProps";

const categories = ["Mon", "Tue", "Wed"];
const series = [{ name: "Revenue", data: [1200, 1800, 1500] }];
const rows = [
  { day: "Mon", revenue: 1200, margin: 30 },
  { day: "Tue", revenue: 1800, margin: 34 },
];

function inContainer(chart: ReactElement) {
  return render(
    <ChartContainer theme={cleanTheme} width={480} height={240} renderer="canvas">
      {chart}
    </ChartContainer>,
  );
}

const last = (key: string) => plotProps[key]!.at(-1);

describe("chart-level valueFormat / yDomain / yTickCount", () => {
  it("reach the uPlot line renderer", () => {
    const format = (value: number) => `$${value}`;
    inContainer(
      <LineChart
        categories={categories}
        series={series}
        valueFormat={format}
        yDomain={[0, "auto"]}
        yTickCount={4}
      />,
    );
    expect(last("line")).toMatchObject({ valueFormat: format, yDomain: [0, "auto"], yTickCount: 4 });
  });

  it("reach the uPlot bar renderer", () => {
    inContainer(<BarChart categories={categories} series={series} valueFormat="compact" yDomain={[0, 3000]} />);
    expect(last("bar")).toMatchObject({ valueFormat: "compact", yDomain: [0, 3000] });
  });

  it("come from <YAxis tickFormat> in composable charts, with the chart prop winning", () => {
    const tick = (value: number) => `${value}%`;
    inContainer(
      <CartesianChart data={rows}>
        <XAxis dataKey="day" />
        <YAxis tickFormat={tick} />
        <Bar dataKey="revenue" />
        <Line dataKey="margin" />
      </CartesianChart>,
    );
    expect(last("combo")).toMatchObject({ valueFormat: tick });

    inContainer(
      <CartesianChart data={rows} valueFormat="currency">
        <XAxis dataKey="day" />
        <YAxis tickFormat={tick} />
        <Bar dataKey="revenue" />
      </CartesianChart>,
    );
    expect(last("combo")).toMatchObject({ valueFormat: "currency" });
  });
});

describe("useResolvedCartesianProps", () => {
  it("passes a YAxis tickFormat function through as valueFormat", () => {
    const tick = (value: number) => `#${value}`;
    let resolved: ReturnType<typeof useResolvedCartesianProps> | undefined;
    function Probe() {
      resolved = useResolvedCartesianProps(
        {
          data: rows,
          children: [<XAxis key="x" dataKey="day" />, <YAxis key="y" tickFormat={tick} />, <Line key="l" dataKey="revenue" />],
        },
        undefined,
        ["line"],
      );
      return null;
    }
    render(<Probe />);
    expect(resolved?.valueFormat).toBe(tick);
  });
});
