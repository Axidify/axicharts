import { describe, expect, it } from "vitest";
import { composeChartGraphics } from "./composeChartGraphics";
import { ChartGraphic, GraphicRect, GraphicText } from "../graphic/graphicMarks";

describe("composeChartGraphics", () => {
  it("composes raw ChartGraphic passthrough", () => {
    const element = { type: "circle" as const, shape: { r: 8 } };
    const graphics = composeChartGraphics([
      <ChartGraphic key="g" element={element} />,
    ]);
    expect(graphics).toEqual([element]);
  });

  it("composes typed graphic marks", () => {
    const graphics = composeChartGraphics([
      <GraphicRect
        key="r"
        left="plot:0.2"
        top="plot:0.1"
        width={80}
        height={40}
        style={{ fill: "#fef3c7", opacity: 0.6 }}
      />,
      <GraphicText
        key="t"
        left="category:10:00"
        top="value:74"
        text="Incident"
        style={{ fill: "#dc2626", fontSize: 12 }}
      />,
    ]);

    expect(graphics).toEqual([
      {
        type: "rect",
        left: "plot:0.2",
        top: "plot:0.1",
        shape: { width: 80, height: 40 },
        style: { fill: "#fef3c7", opacity: 0.6 },
      },
      {
        type: "text",
        left: "category:10:00",
        top: "value:74",
        style: { fill: "#dc2626", fontSize: 12, text: "Incident" },
      },
    ]);
  });
});
