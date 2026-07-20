import { describe, expect, it } from "vitest";
import { isValidElement } from "react";
import { render, waitFor } from "@testing-library/react";
import { compilePanel } from "./compilePanel";
import { ejectPanel } from "./eject";

const ROWS = [
  { hour: "06:00", temp: 62 },
  { hour: "08:00", temp: 68 },
  { hour: "10:00", temp: 74 },
];

describe("compilePanel annotations", () => {
  it("passes annotations to cartesian charts", async () => {
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
    const { container } = render(
      <div style={{ width: 480, height: 240 }}>{panel}</div>,
    );
    await waitFor(() => {
      expect(
        container.querySelector(".axicharts-uplot, [data-engine='svg']"),
      ).toBeTruthy();
    });
  });

  it("reads annotations from props.annotations", async () => {
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
    const { container } = render(
      <div style={{ width: 480, height: 240 }}>{panel}</div>,
    );
    await waitFor(() => {
      expect(
        container.querySelector(".axicharts-uplot, [data-engine='svg']"),
      ).toBeTruthy();
    });
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

  it("preserves mixed annotation order and marker props", () => {
    const annotations = [
      { type: "band" as const, min: 70, max: 85, label: "Warn", tone: "warning" as const },
      { type: "line" as const, value: 90, label: "SLO", tone: "critical" as const },
      {
        type: "marker" as const,
        x: "14:00",
        y: 88,
        label: "Peak",
        tone: "critical" as const,
        draggable: true,
        id: "peak",
      },
      {
        type: "label" as const,
        text: "Review",
        x: "10:00",
        y: 74,
        position: "top" as const,
        tone: "info" as const,
      },
    ];

    const jsx = ejectPanel({
      type: "line",
      encoding: {
        x: { field: "hour" },
        y: { field: "temp" },
      },
      annotations,
    });

    const bandIndex = jsx.indexOf('"type":"band"');
    const lineIndex = jsx.indexOf('"type":"line"');
    const markerIndex = jsx.indexOf('"type":"marker"');
    const labelIndex = jsx.indexOf('"type":"label"');

    expect(bandIndex).toBeLessThan(lineIndex);
    expect(lineIndex).toBeLessThan(markerIndex);
    expect(markerIndex).toBeLessThan(labelIndex);
    expect(jsx).toContain('"draggable":true');
    expect(jsx).toContain('"id":"peak"');
    expect(jsx).toContain('"position":"top"');
  });

  it("compiles empty annotations without error", () => {
    const panel = compilePanel(
      {
        type: "line",
        height: 240,
        width: 480,
        encoding: {
          x: { field: "hour" },
          y: { field: "temp" },
        },
        annotations: [],
      },
      ROWS,
    );

    expect(isValidElement(panel)).toBe(true);
  });
});
