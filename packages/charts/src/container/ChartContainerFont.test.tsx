import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { cleanTheme, createTheme } from "@axicharts/charts-theme";
import { ChartContainer } from "./ChartContainer";

describe("ChartContainer typography", () => {
  it("applies the theme font family so React chrome inherits it", () => {
    const brand = createTheme(cleanTheme, { name: "brand", font: { family: "Inter, sans-serif" } });
    const { container } = render(
      <ChartContainer theme={brand} width={200} height={100}>
        <span>chart</span>
      </ChartContainer>,
    );
    expect((container.firstElementChild as HTMLElement).style.fontFamily).toBe("Inter, sans-serif");
  });

  it("leaves font-family to the page by default", () => {
    const { container } = render(
      <ChartContainer theme={cleanTheme} width={200} height={100}>
        <span>chart</span>
      </ChartContainer>,
    );
    expect((container.firstElementChild as HTMLElement).style.fontFamily).toBe("");
  });
});
