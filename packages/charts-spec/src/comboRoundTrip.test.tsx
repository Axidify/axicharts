import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { compilePanel } from "./compilePanel";
import { ejectPanel } from "./eject";

const COMBO_SPEC = {
  type: "combo" as const,
  title: "Weekly throughput",
  encoding: {
    x: { field: "week" },
    y: [
      { field: "volume", label: "Volume", kind: "bar" as const },
      { field: "avg", label: "Daily avg", kind: "line" as const },
    ],
  },
  props: { dualAxis: "auto" as const, showValues: true },
  height: 200,
};

const COMBO_ROWS = [
  { week: "W1", volume: 120, avg: 17 },
  { week: "W2", volume: 90, avg: 13 },
];

describe("combo spec round-trip", () => {
  it("compiles, renders, and ejects ComboChart with dualAxis and mixed kinds", () => {
    const panel = compilePanel(COMBO_SPEC, COMBO_ROWS);
    const { container } = render(panel);
    expect(container.innerHTML.length).toBeGreaterThan(0);

    const jsx = ejectPanel(COMBO_SPEC, "rows");
    expect(jsx).toContain("ComboChart");
    expect(jsx).toContain('kind: "bar"');
    expect(jsx).toContain('kind: "line"');
    expect(jsx).toContain('dualAxis="auto"');
    expect(jsx).toContain("showValues");
    expect(jsx).toContain("row.volume");
    expect(jsx).toContain("row.avg");
    expect(jsx).not.toContain("encoding.");
  });
});
