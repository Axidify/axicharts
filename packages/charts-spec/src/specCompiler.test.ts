import { afterEach, describe, expect, it } from "vitest";
import { planPanelsFromProfile } from "./plan";
import {
  applySpecCompilers,
  clearSpecCompilers,
  registerSpecCompiler,
} from "./specCompiler";

afterEach(() => {
  clearSpecCompilers();
});

describe("registerSpecCompiler", () => {
  it("transforms panels before compilePanel renders", () => {
    registerSpecCompiler({
      id: "fill-lines",
      compile(panel) {
        if (panel.type !== "line") return panel;
        return { ...panel, fill: true, height: 180 };
      },
    });

    const panel = applySpecCompilers(
      {
        type: "line",
        encoding: {
          x: { field: "day", type: "nominal" },
          y: { field: "value", type: "quantitative" },
        },
      },
      [{ day: "Mon", value: 10 }],
    );

    expect(panel.fill).toBe(true);
    expect(panel.height).toBe(180);
  });

  it("runs during profile planning", () => {
    registerSpecCompiler({
      id: "ops-height",
      compile(panel, context) {
        if (context.profile?.metrics[0]?.tags?.vertical !== "ops") return panel;
        return { ...panel, height: 160 };
      },
    });

    const panels = planPanelsFromProfile({
      metrics: [{ name: "cpu", tags: { vertical: "ops" } }],
    });

    expect(panels[0]?.height).toBe(160);
  });

  it("rejects duplicate compiler ids", () => {
    registerSpecCompiler({ id: "demo", compile: (panel) => panel });
    expect(() =>
      registerSpecCompiler({ id: "demo", compile: (panel) => panel }),
    ).toThrow(/already registered/);
  });
});
