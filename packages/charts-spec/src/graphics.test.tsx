import { describe, expect, it } from "vitest";
import { isValidElement } from "react";
import { render } from "@testing-library/react";
import { compilePanel } from "./compilePanel";
import { ejectPanel } from "./eject";

const ROWS = [
  { hour: "06:00", temp: 62 },
  { hour: "08:00", temp: 68 },
  { hour: "10:00", temp: 74 },
];

const GRAPHICS = [
  {
    type: "rect" as const,
    left: "plot:0.15",
    top: "plot:0.2",
    shape: { width: 120, height: 48, r: 4 },
    style: { fill: "#fef3c7", opacity: 0.55 },
  },
  {
    type: "text" as const,
    left: "category:10:00",
    top: "value:74",
    style: { text: "Incident", fill: "#dc2626", fontSize: 12 },
  },
];

describe("compilePanel graphics", () => {
  it("passes graphics to cartesian charts", () => {
    const panel = compilePanel(
      {
        type: "line",
        height: 240,
        width: 480,
        encoding: {
          x: { field: "hour" },
          y: { field: "temp" },
        },
        graphics: GRAPHICS,
      },
      ROWS,
    );

    expect(isValidElement(panel)).toBe(true);
    const { container } = render(panel);
    expect(container.querySelector(".axicharts-graphic-overlay")).toBeTruthy();
  });
});

describe("ejectPanel graphics", () => {
  it("emits graphics prop on cartesian panels", () => {
    const jsx = ejectPanel({
      type: "line",
      encoding: {
        x: { field: "hour" },
        y: { field: "temp" },
      },
      graphics: GRAPHICS,
    });

    expect(jsx).toContain("graphics=");
    expect(jsx).toContain("Incident");
  });
});
