import { describe, expect, it } from "vitest";
import {
  chartPropsWithoutChartConfig,
  readPanelChartConfig,
} from "./panelChartConfig";

describe("panelChartConfig", () => {
  it("reads chartConfig from panel props", () => {
    expect(
      readPanelChartConfig({
        chartConfig: {
          revenue: { label: "Revenue", color: "#22c55e" },
        },
      }),
    ).toEqual({
      revenue: { label: "Revenue", color: "#22c55e" },
    });
  });

  it("strips chartConfig from chart props", () => {
    expect(
      chartPropsWithoutChartConfig({
        showValues: true,
        chartConfig: { revenue: { label: "Revenue" } },
      }),
    ).toEqual({ showValues: true });
  });
});
