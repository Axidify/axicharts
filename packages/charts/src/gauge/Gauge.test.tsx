import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { cleanTheme, liveTheme } from "@axicharts/charts-theme";
import { ChartContainer } from "../container/ChartContainer";
import { Gauge } from "./Gauge";

const LIGHT_TRACK = "#e2e8f0";
const DARK_TRACK = "#334155";

function trackStrokes(container: HTMLElement): string[] {
  return [...container.querySelectorAll("[stroke]")].map((node) => node.getAttribute("stroke") ?? "");
}

describe("Gauge surface default", () => {
  it("follows a light theme inside a container", () => {
    const { container } = render(
      <ChartContainer theme={cleanTheme} height={120} width={160}>
        <Gauge value={78} label="OEE" />
      </ChartContainer>,
    );
    expect(trackStrokes(container)).toContain(LIGHT_TRACK);
    expect(trackStrokes(container)).not.toContain(DARK_TRACK);
  });

  it("follows a dark theme inside a container", () => {
    const { container } = render(
      <ChartContainer theme={liveTheme} height={120} width={160}>
        <Gauge value={78} label="OEE" />
      </ChartContainer>,
    );
    expect(trackStrokes(container)).toContain(DARK_TRACK);
  });
});
