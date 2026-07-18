import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { SvgCartesianLine } from "./SvgCartesianLine";
import { cleanTheme, studioTheme } from "@axicharts/charts-theme";

describe("SvgCartesianLine", () => {
  it("renders an svg static engine chart", () => {
    const { container } = render(
      <SvgCartesianLine
        width={320}
        height={160}
        categories={["Mon", "Tue", "Wed"]}
        series={[{ name: "p95", data: [12, 18, 9] }]}
        theme={cleanTheme}
        fill
      />,
    );

    expect(container.querySelector('[data-engine="svg"]')).toBeTruthy();
    expect(container.querySelector("path")).toBeTruthy();
  });

  it("calls renderPath when provided on a series", () => {
    const renderPath = vi.fn(({ defaultPath, color }) => (
      <path data-testid="custom-path" d={defaultPath} stroke={color} />
    ));

    const { getByTestId } = render(
      <SvgCartesianLine
        width={320}
        height={160}
        categories={["Mon", "Tue", "Wed"]}
        series={[
          {
            name: "custom",
            data: [12, 18, 9],
            renderPath,
          },
        ]}
        theme={cleanTheme}
      />,
    );

    expect(renderPath).toHaveBeenCalledTimes(1);
    expect(renderPath.mock.calls[0]?.[0]).toMatchObject({
      categories: ["Mon", "Tue", "Wed"],
      fill: false,
      color: expect.any(String),
      defaultPath: expect.stringMatching(/^M/),
    });
    expect(getByTestId("custom-path")).toBeTruthy();
    expect(
      document.querySelector('[data-series-custom]'),
    ).toBeTruthy();
  });

  it("renders studio gradient defs for area charts", () => {
    const { container } = render(
      <SvgCartesianLine
        width={320}
        height={160}
        categories={["Mon", "Tue", "Wed"]}
        series={[{ name: "p95", data: [12, 18, 9] }]}
        theme={studioTheme}
        fill
      />,
    );

    expect(container.querySelector("linearGradient")).toBeTruthy();
    expect(container.querySelector('[id$="-area-gradient"]')).toBeTruthy();
  });
});
