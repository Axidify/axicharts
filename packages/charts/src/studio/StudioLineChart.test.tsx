import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudioLineChart } from "./StudioLineChart";

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

describe("StudioLineChart", () => {
  it("renders a static studio-themed chart shell", () => {
    render(
      <StudioLineChart
        title="p95 latency"
        labels={["Mon", "Tue", "Wed"]}
        data={[12, 18, 9]}
      />,
    );

    expect(screen.getByText("p95 latency")).toBeTruthy();
    const container = screen.getByTestId("chart-container");
    expect(container.getAttribute("data-mode")).toBe("static");
    expect(container.getAttribute("data-theme")).toBe("studio");
    expect(container.getAttribute("data-height")).toBe("240");
    expect(screen.getByTestId("line-chart").getAttribute("data-fill")).toBe("true");
  });
});
