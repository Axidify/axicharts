import type { ChartBlockMarkSpec, PanelSpec } from "./types";

export type BarOrientation = "horizontal" | "vertical";

export function readPanelOrientation(spec: PanelSpec): BarOrientation | undefined {
  if (spec.orientation === "horizontal" || spec.orientation === "vertical") {
    return spec.orientation;
  }
  const fromProps = spec.props?.orientation;
  if (fromProps === "horizontal" || fromProps === "vertical") {
    return fromProps;
  }
  return undefined;
}

function isBarOnlyMarks(marks: ChartBlockMarkSpec[]): boolean {
  return marks.length > 0 && marks.every((mark) => mark.type === "bar");
}

export function isHorizontalBarPanel(spec: PanelSpec): boolean {
  if (readPanelOrientation(spec) !== "horizontal") return false;
  if (spec.type === "bar") return true;
  if (spec.type === "cartesian" || spec.type === "blocks") {
    return isBarOnlyMarks(spec.marks ?? []);
  }
  return false;
}

export function panelOrientationProps(
  spec: PanelSpec,
): { orientation: "horizontal" } | Record<string, never> {
  if (isHorizontalBarPanel(spec)) {
    return { orientation: "horizontal" };
  }
  return {};
}

export function horizontalBarPanelHeight(categoryCount: number): number {
  return Math.max(240, categoryCount * 28 + 48);
}
