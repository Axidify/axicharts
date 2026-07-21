import { describe, expect, it } from "vitest";
import { isCompactTile } from "./themeBridge";
import { resolveRadarLayout, radarIndicatorOrder } from "./radarLayout";

describe("radar compact posture", () => {
  it("treats 360×280 as a compact dashboard tile", () => {
    expect(isCompactTile(360, 280)).toBe(true);
    expect(isCompactTile(480, 360)).toBe(false);
  });
});

describe("radarIndicatorOrder", () => {
  it("mirrors indicator order so ECharts spokes match Recharts clockwise layout", () => {
    expect(radarIndicatorOrder(["R", "Lat", "Thr", "Cost", "Sec"])).toEqual([
      "R",
      "Sec",
      "Cost",
      "Thr",
      "Lat",
    ]);
  });
});

describe("resolveRadarLayout", () => {
  it("matches Recharts spoke order and hides radial ticks on compact tiles", () => {
    const layout = resolveRadarLayout(360, 280, 2);

    expect(layout.compact).toBe(true);
    expect(layout.showLegend).toBe(true);
    expect(layout.startAngle).toBe(90);
    expect(layout.hideRadialLabels).toBe(true);
    expect(layout.center).toEqual(["50%", "46%"]);
  });
});
