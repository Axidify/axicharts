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

describe("compilePanel annotations", () => {
  it("passes annotations to cartesian charts", () => {
    const panel = compilePanel(
      {
        type: "line",
        height: 240,
        width: 480,
        encoding: {
          x: { field: "hour" },
          y: { field: "temp" },
        },
        annotations: [
          { type: "line", value: 75, label: "Limit", tone: "warning" },
          { type: "label", text: "Peak", x: "10:00", y: 74 },
        ],
      },
      ROWS,
    );

    expect(isValidElement(panel)).toBe(true);
    const { container } = render(panel);
    expect(container.querySelector(".axicharts-uplot")).toBeTruthy();
  });

  it("reads annotations from props.annotations", () => {
    const panel = compilePanel(
      {
        type: "line",
        height: 240,
        width: 480,
        encoding: {
          x: { field: "hour" },
          y: { field: "temp" },
        },
        props: {
          annotations: [{ type: "band", min: 60, max: 80, tone: "warning" }],
        },
      },
      ROWS,
    );

    expect(isValidElement(panel)).toBe(true);
    const { container } = render(panel);
    expect(container.querySelector(".axicharts-uplot")).toBeTruthy();
  });
});

describe("ejectPanel annotations", () => {
  it("emits annotations prop on cartesian panels", () => {
    const jsx = ejectPanel({
      type: "line",
      encoding: {
        x: { field: "hour" },
        y: { field: "temp" },
      },
      annotations: [{ type: "line", value: 90, label: "SLO" }],
    });

    expect(jsx).toContain("annotations=");
    expect(jsx).toContain("SLO");
  });
});
