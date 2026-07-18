import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SvgCartesianLine } from "./SvgCartesianLine";
import { cleanTheme } from "@axicharts/charts-theme";

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
});
