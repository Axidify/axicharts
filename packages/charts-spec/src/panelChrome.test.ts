import { describe, expect, it } from "vitest";
import { chartPropsWithoutChromeMeta, readPanelChrome } from "./panelChrome";

describe("panelChrome", () => {
  it("reads legend and tooltip variants from props", () => {
    expect(
      readPanelChrome({
        legendVariant: "inline",
        tooltipVariant: "dense",
      }),
    ).toEqual({
      legendVariant: "inline",
      tooltipVariant: "dense",
    });
  });

  it("ignores invalid variant strings", () => {
    expect(
      readPanelChrome({
        legendVariant: "fancy",
        tooltipVariant: "popover",
      }),
    ).toEqual({});
  });

  it("strips chrome meta from chart props", () => {
    expect(
      chartPropsWithoutChromeMeta({
        showValues: true,
        legendVariant: "compact",
        tooltipVariant: "minimal",
      }),
    ).toEqual({ showValues: true });
  });
});
