import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ChartContainer } from "../container/ChartContainer";
import { cleanTheme } from "@axicharts/charts-theme";
import { Stat } from "./Stat";

describe("Stat", () => {
  it("renders unit and delta chip", () => {
    const { container } = render(
      <ChartContainer theme={cleanTheme} height={72} width={180}>
        <Stat
          value="12.4"
          unit="k"
          label="Requests today"
          delta="+8.2%"
          surface="light"
        />
      </ChartContainer>,
    );

    expect(container.textContent).toContain("12.4");
    expect(container.textContent).toContain("k");
    expect(container.textContent).toContain("+8.2%");
    expect(container.textContent).toContain("Requests today");
    expect(container.querySelector(".axicharts-stat-delta")).toBeTruthy();
  });

});
