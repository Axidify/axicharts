import { Children, isValidElement, type ReactNode } from "react";
import type { ChartGraphicElement, GraphicStyle } from "@axicharts/charts-canvas";
import { readMarkKind } from "../composable/readMarkKind";

function styleFromProps(props: Record<string, unknown>): GraphicStyle | undefined {
  const style = props.style as GraphicStyle | undefined;
  if (style) return style;
  const fill = props.fill as string | undefined;
  const stroke = props.stroke as string | undefined;
  if (!fill && !stroke) return undefined;
  return { fill, stroke };
}

export function composeChartGraphics(children: ReactNode): ChartGraphicElement[] {
  const graphics: ChartGraphicElement[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const kind = readMarkKind(child.type);
    const props = child.props as Record<string, unknown>;

    switch (kind) {
      case "graphic":
        graphics.push(props.element as ChartGraphicElement);
        break;
      case "graphicRect":
        graphics.push({
          type: "rect",
          left: props.left as number | string | undefined,
          top: props.top as number | string | undefined,
          shape: {
            x: props.x as number | undefined,
            y: props.y as number | undefined,
            width: props.width as number | undefined,
            height: props.height as number | undefined,
            r: props.r as number | undefined,
          },
          style: styleFromProps(props),
          z: props.z as number | undefined,
          id: props.id as string | undefined,
        });
        break;
      case "graphicCircle":
        graphics.push({
          type: "circle",
          left: props.left as number | string | undefined,
          top: props.top as number | string | undefined,
          shape: {
            cx: props.cx as number | undefined,
            cy: props.cy as number | undefined,
            r: props.r as number | undefined,
          },
          style: styleFromProps(props),
          z: props.z as number | undefined,
          id: props.id as string | undefined,
        });
        break;
      case "graphicText":
        graphics.push({
          type: "text",
          left: props.left as number | string | undefined,
          top: props.top as number | string | undefined,
          style: {
            ...styleFromProps(props),
            text: props.text as string | undefined,
          },
          z: props.z as number | undefined,
          id: props.id as string | undefined,
        });
        break;
      case "graphicLine":
        graphics.push({
          type: "line",
          shape: {
            x1: props.x1 as number | undefined,
            y1: props.y1 as number | undefined,
            x2: props.x2 as number | undefined,
            y2: props.y2 as number | undefined,
          },
          style: styleFromProps(props),
          z: props.z as number | undefined,
          id: props.id as string | undefined,
        });
        break;
      case "graphicGroup": {
        const groupChildren = composeChartGraphics(props.children as ReactNode);
        graphics.push({
          type: "group",
          left: props.left as number | string | undefined,
          top: props.top as number | string | undefined,
          children: groupChildren,
          z: props.z as number | undefined,
          id: props.id as string | undefined,
        });
        break;
      }
      case "graphicImage":
        graphics.push({
          type: "image",
          left: props.left as number | string | undefined,
          top: props.top as number | string | undefined,
          style: {
            image: props.image as string | undefined,
            width: props.width as number | undefined,
            height: props.height as number | undefined,
          },
          z: props.z as number | undefined,
          id: props.id as string | undefined,
        });
        break;
    }
  });

  return graphics;
}
