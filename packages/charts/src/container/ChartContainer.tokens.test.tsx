import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { ChartContainer, LineChart } from "../index";
import { cleanTheme } from "@axicharts/charts-theme";
import "../../../charts-theme/tokens.css";

describe("ChartContainer css tokens", () => {
  const previous = new Map<string, string>();

  beforeEach(() => {
    for (const name of ["--chart-1", "--chart-2"]) {
      previous.set(name, document.documentElement.style.getPropertyValue(name));
    }
    document.documentElement.style.setProperty("--chart-1", "221 83% 53%");
    document.documentElement.style.setProperty("--chart-2", "188 94% 35%");
  });

  afterEach(() => {
    for (const [name, value] of previous.entries()) {
      if (value) {
        document.documentElement.style.setProperty(name, value);
      } else {
        document.documentElement.style.removeProperty(name);
      }
    }
  });

  it("resolves css chart tokens into the layout theme", () => {
    const { container } = render(
      <ChartContainer theme={cleanTheme} mode="static" height={160} width={320}>
        <LineChart
          categories={["A", "B", "C"]}
          series={[{ name: "p95", data: [1, 2, 3] }]}
        />
      </ChartContainer>,
    );

    expect(container.querySelector('[data-engine="svg"]')).toBeTruthy();
  });
});
