import { describe, expect, it } from "vitest";
import { compilePanel } from "./compilePanel";
import { ejectPanel } from "./eject";
import blocksFixture from "../examples/blocks-revenue-target.panel.json";

const ROWS = [
  { week: "W1", revenue: 42, target: 40 },
  { week: "W2", revenue: 48, target: 44 },
  { week: "W3", revenue: 51, target: 48 },
  { week: "W4", revenue: 47, target: 50 },
];

describe("blocks spec round-trip", () => {
  it("compiles blocks panels to ComboChart", () => {
    const panel = compilePanel(blocksFixture, ROWS);
    expect(panel).toBeTruthy();
    const jsx = ejectPanel(blocksFixture, "rows");
    expect(jsx).toContain("ComboChart");
    expect(jsx).toContain("referenceLines");
    expect(jsx).toContain("thresholdBands");
    expect(jsx).toContain("Revenue");
    expect(jsx).toContain("Target");
  });

  it("compiles inline blocks spec with marks array", () => {
    const panel = compilePanel(
      {
        type: "blocks",
        encoding: { x: { field: "week" } },
        marks: [
          { type: "bar", field: "revenue", label: "Revenue" },
          { type: "line", field: "target", label: "Target" },
        ],
      },
      ROWS,
    );
    expect(panel).toBeTruthy();
  });
});
