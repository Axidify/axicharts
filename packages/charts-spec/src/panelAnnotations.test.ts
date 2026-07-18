import { describe, expect, it } from "vitest";
import { readPanelAnnotations } from "./panelAnnotations";

describe("readPanelAnnotations", () => {
  it("reads top-level annotations array", () => {
    const annotations = readPanelAnnotations({
      type: "line",
      annotations: [{ type: "line", value: 90, label: "SLO" }],
    });
    expect(annotations).toEqual([{ type: "line", value: 90, label: "SLO" }]);
  });

  it("returns empty array for explicit empty annotations", () => {
    expect(
      readPanelAnnotations({
        type: "line",
        annotations: [],
      }),
    ).toEqual([]);
  });

  it("reads props.annotations when top-level is absent", () => {
    const annotations = readPanelAnnotations({
      type: "bar",
      props: {
        annotations: [{ type: "band", min: 0, max: 50, tone: "warning" }],
      },
    });
    expect(annotations?.[0]?.type).toBe("band");
  });
});
