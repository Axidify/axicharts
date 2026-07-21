import { describe, expect, it } from "vitest";
import {
  checkRenderSurface,
  detectRenderSurface,
  hasEmptyStateOverlay,
  summarizeRenderBattery,
} from "./renderBattery";

describe("renderBattery helpers", () => {
  it("detects uplot and echarts surfaces", () => {
    const uplot = document.createElement("div");
    uplot.innerHTML = '<div class="axicharts-uplot"></div>';
    expect(detectRenderSurface(uplot)).toBe("uplot");

    const echarts = document.createElement("div");
    echarts.innerHTML = '<div class="axicharts-echarts"></div>';
    expect(detectRenderSurface(echarts)).toBe("echarts");
  });

  it("accepts cartesian as uplot or svg", () => {
    const svg = document.createElement("div");
    svg.innerHTML = '<div data-engine="svg"></div>';
    expect(checkRenderSurface(svg, "cartesian").ok).toBe(true);
  });

  it("detects empty-state overlay", () => {
    const el = document.createElement("div");
    el.innerHTML = '<div class="axicharts-state-overlay">No data</div>';
    expect(hasEmptyStateOverlay(el)).toBe(true);
  });

  it("summarizes pass/fail/crash counts", () => {
    const summary = summarizeRenderBattery([
      { id: "a", group: "g", expect: "pass", outcome: "pass", details: "" },
      { id: "b", group: "g", expect: "pass", outcome: "crash", details: "boom" },
      { id: "c", group: "g", expect: "compile_throw", outcome: "pass", details: "" },
    ]);
    expect(summary.pass).toBe(1);
    expect(summary.crash).toBe(1);
    expect(summary.compile_throw_ok).toBe(1);
    expect(summary.failures).toHaveLength(1);
  });
});
