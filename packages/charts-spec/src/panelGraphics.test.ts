import { describe, expect, it } from "vitest";
import { readPanelGraphics } from "./panelGraphics";

describe("readPanelGraphics", () => {
  it("reads top-level graphics array", () => {
    const graphics = readPanelGraphics({
      type: "line",
      graphics: [{ type: "rect", shape: { width: 10, height: 10 } }],
    });
    expect(graphics?.[0]?.type).toBe("rect");
  });

  it("reads props.graphics when top-level is absent", () => {
    const graphics = readPanelGraphics({
      type: "scatter",
      props: {
        graphics: [{ type: "text", style: { text: "Note" } }],
      },
    });
    expect(graphics?.[0]?.type).toBe("text");
  });
});
