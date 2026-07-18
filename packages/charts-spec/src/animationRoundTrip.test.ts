import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { compilePanel } from "./compilePanel";
import { ejectPanel } from "./eject";
import { readPanelAnimation } from "./panelAnimation";
import { readPanelLiveAnimate } from "./panelLiveAnimate";

const ROWS = [
  { month: "Jan", revenue: 120 },
  { month: "Feb", revenue: 140 },
];

describe("animation spec round-trip", () => {
  it("reads top-level animation", () => {
    expect(
      readPanelAnimation({
        animation: "enter",
      }),
    ).toBe("enter");
  });

  it("reads props.animation fallback", () => {
    expect(
      readPanelAnimation({
        props: { animation: { enter: { duration: 400 } } },
      }),
    ).toEqual({ enter: { duration: 400 } });
  });

  it("compiles line panel with animation and ejects animate prop", () => {
    const spec = {
      type: "line" as const,
      animation: "enter" as const,
      encoding: {
        x: { field: "month" },
        y: { field: "revenue" },
      },
      height: 200,
    };

    const panel = compilePanel(spec, ROWS);
    const { container } = render(panel);
    expect(container.innerHTML.length).toBeGreaterThan(0);

    const jsx = ejectPanel(spec, "rows");
    expect(jsx).toContain('animate={"enter"}');
  });

  it("compiles bar panel with props.animation object", () => {
    const spec = {
      type: "bar" as const,
      props: {
        animation: {
          enter: { duration: 500 },
          update: { duration: 250 },
        },
      },
      encoding: {
        x: { field: "month" },
        y: { field: "revenue" },
      },
    };

    const panel = compilePanel(spec, ROWS);
    expect(render(panel).container.innerHTML.length).toBeGreaterThan(0);

    const jsx = ejectPanel(spec, "rows");
    expect(jsx).toContain('"enter":{"duration":500}');
    expect(jsx).toContain('"update":{"duration":250}');
  });

  it("ejects preset name when config matches canonical stagger preset", () => {
    const spec = {
      type: "line" as const,
      animation: {
        enter: {
          duration: 520,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          delay: 0,
          staggerMs: 80,
        },
      },
      encoding: {
        x: { field: "month" },
        y: { field: "revenue" },
      },
    };

    const jsx = ejectPanel(spec, "rows");
    expect(jsx).toContain('animate={"stagger"}');
  });

  it("ejects preset name when config matches canonical spring preset", () => {
    const spec = {
      type: "bar" as const,
      animation: {
        enter: {
          duration: 680,
          easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          delay: 0,
        },
      },
      encoding: {
        x: { field: "month" },
        y: { field: "revenue" },
      },
    };

    const jsx = ejectPanel(spec, "rows");
    expect(jsx).toContain('animate={"spring"}');
  });

  it("compiles line panel with stagger animation preset", () => {
    const spec = {
      type: "line" as const,
      animation: "stagger" as const,
      encoding: {
        x: { field: "month" },
        y: { field: "revenue" },
      },
      height: 200,
    };

    const panel = compilePanel(spec, ROWS);
    const { container } = render(panel);
    expect(container.innerHTML.length).toBeGreaterThan(0);

    const jsx = ejectPanel(spec, "rows");
    expect(jsx).toContain('animate={"stagger"}');
  });

  it("compiles line panel with liveAnimate crossfade and ejects prop", () => {
    const spec = {
      type: "line" as const,
      liveAnimate: "crossfade" as const,
      mode: "live" as const,
      encoding: {
        x: { field: "month" },
        y: { field: "revenue" },
      },
      height: 200,
    };

    const panel = compilePanel(spec, ROWS, { mode: "live" });
    const { container } = render(panel);
    expect(container.innerHTML.length).toBeGreaterThan(0);

    const jsx = ejectPanel(spec, "rows");
    expect(jsx).toContain('liveAnimate="crossfade"');
  });

  it("reads props.liveAnimate fallback", () => {
    expect(
      readPanelLiveAnimate({
        props: { liveAnimate: "crossfade" },
      }),
    ).toBe("crossfade");
  });
});
