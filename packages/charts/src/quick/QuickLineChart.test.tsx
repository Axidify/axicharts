import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuickLineChart } from "./QuickLineChart";

afterEach(() => {
  cleanup();
});

vi.mock("../container/ChartContainer", () => ({
  ChartContainer: ({
    children,
    theme,
    mode,
    height,
    width,
  }: {
    children: React.ReactNode;
    theme: unknown;
    mode: string;
    height: number;
    width: string;
  }) => (
    <div
      data-testid="chart-container"
      data-mode={mode}
      data-height={height}
      data-width={width}
      data-theme={theme && typeof theme === "object" && "name" in theme ? theme.name : ""}
    >
      {children}
    </div>
  ),
}));

vi.mock("../line/LineChart", () => ({
  LineChart: ({
    categories,
    series,
    fill,
  }: {
    categories: string[];
    series: Array<{ name: string; data: number[] }>;
    fill?: boolean;
  }) => (
    <div
      data-testid="line-chart"
      data-categories={categories.join(",")}
      data-series={series.map((item) => item.name).join(",")}
      data-fill={fill ? "true" : "false"}
    />
  ),
}));

describe("QuickLineChart", () => {
  it("renders LineChart with sensible defaults inside ChartContainer", () => {
    render(<QuickLineChart data={[42, 38, 55]} />);

    const container = screen.getByTestId("chart-container");
    expect(container.getAttribute("data-mode")).toBe("static");
    expect(container.getAttribute("data-height")).toBe("220");
    expect(container.getAttribute("data-width")).toBe("100%");
    expect(container.getAttribute("data-theme")).toBe("clean");

    const lineChart = screen.getByTestId("line-chart");
    expect(lineChart.getAttribute("data-categories")).toBe("1,2,3");
    expect(lineChart.getAttribute("data-series")).toBe("value");
    expect(lineChart.getAttribute("data-fill")).toBe("true");
  });

  it("forwards labels, title, height, theme, and mode", () => {
    render(
      <QuickLineChart
        data={[10, 20]}
        labels={["A", "B"]}
        title="Latency"
        height={320}
        mode="interactive"
        name="p95"
        theme={{ name: "live" } as never}
      />,
    );

    expect(screen.getByText("Latency")).toBeTruthy();
    expect(screen.getByTestId("chart-container").getAttribute("data-height")).toBe(
      "320",
    );
    expect(screen.getByTestId("chart-container").getAttribute("data-mode")).toBe(
      "interactive",
    );
    expect(screen.getByTestId("line-chart").getAttribute("data-categories")).toBe(
      "A,B",
    );
    expect(screen.getByTestId("line-chart").getAttribute("data-series")).toBe("p95");
  });
});
