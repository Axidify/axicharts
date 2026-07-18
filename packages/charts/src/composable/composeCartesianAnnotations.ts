import { Children, isValidElement, type ReactNode } from "react";
import type { ChartAnnotation, SeriesTone } from "@axicharts/charts-canvas";
import { readMarkKind } from "./readMarkKind";

export function composeCartesianAnnotations(
  children: ReactNode,
): ChartAnnotation[] {
  const annotations: ChartAnnotation[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const kind = readMarkKind(child.type);
    if (
      kind !== "annotationLabel" &&
      kind !== "annotationBand" &&
      kind !== "annotationLine" &&
      kind !== "annotationMarker"
    ) {
      return;
    }

    const props = child.props as Record<string, unknown>;
    const tone = props.tone as SeriesTone | undefined;

    switch (kind) {
      case "annotationLabel":
        annotations.push({
          type: "label",
          text: String(props.text ?? ""),
          x: props.x as number | string | undefined,
          y: Number(props.y),
          tone,
          position: props.position as
            | "top"
            | "bottom"
            | "left"
            | "right"
            | "center"
            | undefined,
          id: props.id as string | undefined,
        });
        break;
      case "annotationBand":
        annotations.push({
          type: "band",
          min: Number(props.min),
          max: Number(props.max),
          label: props.label as string | undefined,
          tone,
          id: props.id as string | undefined,
        });
        break;
      case "annotationLine":
        annotations.push({
          type: "line",
          value: Number(props.value),
          label: props.label as string | undefined,
          tone,
          orientation: props.orientation as "horizontal" | "vertical" | undefined,
          x: props.x as number | string | undefined,
          id: props.id as string | undefined,
        });
        break;
      case "annotationMarker":
        annotations.push({
          type: "marker",
          x: props.x as number | string | undefined,
          y: Number(props.y),
          label: props.label as string | undefined,
          tone,
          draggable: props.draggable === true,
          id: props.id as string | undefined,
        });
        break;
    }
  });

  return annotations;
}
