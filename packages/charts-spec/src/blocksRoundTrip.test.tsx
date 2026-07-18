import { describe, expect, it } from "vitest";
import { compilePanel } from "./compilePanel";
import { ejectPanel } from "./eject";
import { normalizeToCartesian } from "./normalizeToCartesian";
import blocksFixture from "../examples/blocks-revenue-target.panel.json";
import cartesianFixture from "../examples/cartesian-revenue-target.panel.json";

const ROWS = [
  { week: "W1", revenue: 42, target: 40 },
  { week: "W2", revenue: 48, target: 44 },
  { week: "W3", revenue: 51, target: 48 },
  { week: "W4", revenue: 47, target: 50 },
];

describe("cartesian spec round-trip", () => {
  it("compiles cartesian panels to CartesianChart", () => {
    const panel = compilePanel(cartesianFixture, ROWS);
    expect(panel).toBeTruthy();
  });

  it("ejects composable CartesianChart + blocks by default", () => {
    const jsx = ejectPanel(cartesianFixture, "rows");
    expect(jsx).toContain("CartesianChart");
    expect(jsx).toContain("<Bar dataKey=\"revenue\"");
    expect(jsx).toContain("<Line dataKey=\"target\"");
    expect(jsx).toContain("<Rule ");
    expect(jsx).toContain("<Band ");
    expect(jsx).not.toContain("ComboChart");
    expect(jsx).not.toContain("referenceLines");
    expect(jsx).not.toContain("thresholdBands");
  });

  it("ejects imperative ComboChart when style=imperative", () => {
    const jsx = ejectPanel(cartesianFixture, "rows", { style: "imperative" });
    expect(jsx).toContain("ComboChart");
    expect(jsx).toContain("referenceLines");
    expect(jsx).toContain("thresholdBands");
  });

  it("preserves mark count on round-trip eject", () => {
    const spec = normalizeToCartesian(cartesianFixture);
    const jsx = ejectPanel(spec, "rows");
    const marks = spec.marks ?? [];
    const dataMarks = marks.filter((m) =>
      ["bar", "line", "area"].includes(m.type),
    );
    const overlayMarks = marks.filter((m) => m.type === "rule" || m.type === "band");
    expect(jsx.match(/<Bar /g)?.length ?? 0).toBe(
      dataMarks.filter((m) => m.type === "bar").length,
    );
    expect(jsx.match(/<Line /g)?.length ?? 0).toBe(
      dataMarks.filter((m) => m.type === "line").length,
    );
    expect(jsx.match(/<Rule /g)?.length ?? 0).toBe(
      overlayMarks.filter((m) => m.type === "rule").length,
    );
    expect(jsx.match(/<Band /g)?.length ?? 0).toBe(
      overlayMarks.filter((m) => m.type === "band").length,
    );
  });

  it("compiles legacy blocks alias", () => {
    const panel = compilePanel(blocksFixture, ROWS);
    expect(panel).toBeTruthy();
    const jsx = ejectPanel(blocksFixture, "rows");
    expect(jsx).toContain("CartesianChart");
  });
});
