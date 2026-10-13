import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { cleanTheme, liveTheme } from "@axicharts/charts-theme";
import { ChartContainer } from "../container/ChartContainer";
import { Digital } from "./Digital";

function valueColor(container: HTMLElement): string {
  const node = [...container.querySelectorAll<HTMLElement>("*")].find(
    (element) => element.textContent === "1428" && element.style.color,
  );
  return node?.style.color ?? "";
}

describe("Digital surface default", () => {
  it("uses light-surface text inside a light-theme container", () => {
    const { container } = render(
      <ChartContainer theme={cleanTheme} height={72} width={180}>
        <Digital value={1428} />
      </ChartContainer>,
    );
    expect(valueColor(container)).toBe("rgb(15, 23, 42)");
  });

  it("uses dark-surface text inside a dark-theme container", () => {
    const { container } = render(
      <ChartContainer theme={liveTheme} height={72} width={180}>
        <Digital value={1428} />
      </ChartContainer>,
    );
    expect(valueColor(container)).toBe("rgb(226, 232, 240)");
  });

  it("keeps the dark default standalone and honors an explicit surface", () => {
    expect(valueColor(render(<Digital value={1428} />).container)).toBe("rgb(226, 232, 240)");
    expect(valueColor(render(<Digital value={1428} surface="light" />).container)).toBe(
      "rgb(15, 23, 42)",
    );
  });
});
