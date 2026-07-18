/**
 * Simplified ECharts `graphic` element subset — JSON-serializable for panel spec.
 *
 * **Plot-relative positioning** (cartesian SVG overlay): prefix axis values with
 * `plot:`, `category:`, or `value:` — e.g. `{ left: "plot:0.5", top: "plot:0.2" }`
 * places the element at 50% across and 20% down the plot area; `{ left: "category:Mon", top: "value:42" }`
 * resolves against category labels and the y-scale. Percent strings (`"50%"`) and
 * pixel numbers are also supported.
 */
export type GraphicStyle = {
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  opacity?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: string;
};

export type ChartGraphicElement =
  | {
      type: "rect";
      left?: number | string;
      top?: number | string;
      shape?: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        r?: number;
      };
      style?: GraphicStyle;
      z?: number;
      id?: string;
    }
  | {
      type: "circle";
      left?: number | string;
      top?: number | string;
      shape?: { cx?: number; cy?: number; r?: number };
      style?: GraphicStyle;
      z?: number;
      id?: string;
    }
  | {
      type: "text";
      left?: number | string;
      top?: number | string;
      style?: GraphicStyle & { text?: string };
      z?: number;
      id?: string;
    }
  | {
      type: "line";
      shape?: { x1?: number; y1?: number; x2?: number; y2?: number };
      style?: GraphicStyle;
      z?: number;
      id?: string;
    }
  | {
      type: "group";
      children?: ChartGraphicElement[];
      left?: number | string;
      top?: number | string;
      z?: number;
      id?: string;
    }
  | {
      type: "image";
      style?: { image?: string; width?: number; height?: number };
      left?: number | string;
      top?: number | string;
      z?: number;
      id?: string;
    };
