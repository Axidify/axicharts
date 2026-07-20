import { describe, expect, it } from "vitest";
import {
  horizontalBarPanelHeight,
  isHorizontalBarPanel,
  panelOrientationProps,
  readPanelOrientation,
} from "./panelOrientation";
import type { PanelSpec } from "./types";

describe("panelOrientation", () => {
  it("reads orientation from panel spec and props fallback", () => {
    expect(
      readPanelOrientation({ type: "bar", orientation: "horizontal" }),
    ).toBe("horizontal");
    expect(
      readPanelOrientation({
        type: "bar",
        props: { orientation: "horizontal" },
      }),
    ).toBe("horizontal");
  });

  it("detects horizontal bar-only cartesian panels", () => {
    const spec: PanelSpec = {
      type: "cartesian",
      orientation: "horizontal",
      marks: [{ type: "bar", field: "amount" }],
    };
    expect(isHorizontalBarPanel(spec)).toBe(true);
    expect(panelOrientationProps(spec)).toEqual({ orientation: "horizontal" });
  });

  it("ignores horizontal orientation on mixed cartesian marks", () => {
    const spec: PanelSpec = {
      type: "cartesian",
      orientation: "horizontal",
      marks: [
        { type: "bar", field: "amount" },
        { type: "line", field: "target" },
      ],
    };
    expect(isHorizontalBarPanel(spec)).toBe(false);
    expect(panelOrientationProps(spec)).toEqual({});
  });

  it("computes minimum height from category count", () => {
    expect(horizontalBarPanelHeight(4)).toBe(240);
    expect(horizontalBarPanelHeight(14)).toBe(14 * 28 + 48);
  });
});
