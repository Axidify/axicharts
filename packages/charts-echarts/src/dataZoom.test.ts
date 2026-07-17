import { describe, expect, it } from "vitest";
import { cleanTheme, liveTheme } from "@axicharts/charts-theme";
import { buildDataZoom } from "./dataZoom";

describe("buildDataZoom", () => {
  it("links both x axes when volume pane is present", () => {
    const zoom = buildDataZoom({ withVolume: true, theme: cleanTheme });
    expect(zoom).toHaveLength(2);
    expect(zoom[0].xAxisIndex).toEqual([0, 1]);
    expect(zoom[1].type).toBe("slider");
  });

  it("uses a single x axis without volume", () => {
    const zoom = buildDataZoom({ withVolume: false, theme: cleanTheme });
    expect(zoom[0].xAxisIndex).toEqual([0]);
  });

  it("themes the slider for dark live surfaces", () => {
    const zoom = buildDataZoom({ withVolume: false, theme: liveTheme });
    const slider = zoom[1];
    expect(slider.borderColor).toBe("#334155");
  });
});
