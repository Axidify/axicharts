import { describe, expect, it } from "vitest";
import { cleanTheme } from "@axicharts/charts-theme";
import {
  chartPropsWithoutStyle,
  readPanelStyle,
  themeWithPanelStyle,
} from "./panelStyle";

describe("panelStyle", () => {
  it("merges panel style tokens into a derived theme", () => {
    const theme = themeWithPanelStyle(cleanTheme, {
      grid: { opacity: 0.4 },
      bar: { radius: 10 },
      line: { strokeWidth: 3 },
    });

    expect(theme.name).toBe("clean-panel");
    expect(theme.grid.opacity).toBe(0.4);
    expect(theme.bar.radius).toBe(10);
    expect(theme.line.strokeWidth).toBe(3);
    expect(theme.area.fillOpacity).toBe(cleanTheme.area.fillOpacity);
  });

  it("returns the base theme when style is empty", () => {
    expect(themeWithPanelStyle(cleanTheme, {})).toBe(cleanTheme);
  });

  it("reads and strips props.style from chart props", () => {
    const props = {
      showValues: true,
      style: { bar: { radius: 6 } },
    };

    expect(readPanelStyle(props)).toEqual({ bar: { radius: 6 } });
    expect(chartPropsWithoutStyle(props)).toEqual({ showValues: true });
  });
});
