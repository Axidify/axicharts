import { describe, expect, it } from "vitest";
import { buildWaterfallBridge } from "./waterfallBridge";

describe("buildWaterfallBridge", () => {
  it("emits IBCS-style horizontal connectors at cumulative levels", () => {
    const bridge = buildWaterfallBridge([
      { name: "Q1", value: 1100, isTotal: true },
      { name: "New ARR", value: 240 },
      { name: "Churn", value: -80, tone: "critical" },
      { name: "Q2", value: 1330, isTotal: true },
    ]);

    expect(bridge.connectors).toEqual([
      [{ coord: ["Q1", 1100] }, { coord: ["New ARR", 1100] }],
      [{ coord: ["New ARR", 1340] }, { coord: ["Churn", 1340] }],
      [{ coord: ["Churn", 1260] }, { coord: ["Q2", 1260] }],
    ]);
  });

  it("tracks negative deltas with bridge levels", () => {
    const bridge = buildWaterfallBridge([
      { name: "Revenue", value: 120 },
      { name: "COGS", value: -45 },
      { name: "EBITDA", value: 0, isTotal: true },
    ]);

    expect(bridge.placeholders).toEqual([0, 75, 0]);
    expect(bridge.values).toEqual([120, 45, 75]);
    expect(bridge.displayValues).toEqual([120, -45, 75]);
    expect(bridge.isTotals).toEqual([false, false, true]);
    expect(bridge.kinds).toEqual(["positive", "negative", "total"]);
    expect(bridge.connectors[0]).toEqual([
      { coord: ["Revenue", 120] },
      { coord: ["COGS", 120] },
    ]);
  });
});
