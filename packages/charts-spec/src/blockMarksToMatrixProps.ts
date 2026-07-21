import type { MatrixMarkSpec, PanelSpec } from "./types";
import { isMatrixDataMark, normalizeMatrixMarks } from "./matrixMarks";
import { matrixFromRows } from "./heatmapEncoding";

export type MatrixHeatmapChartProps = {
  matrix: ReturnType<typeof matrixFromRows>;
  min?: number;
  max?: number;
  showLabels?: boolean;
  showAxes?: boolean;
};

function readValueField(
  marks: MatrixMarkSpec[],
  encoding: PanelSpec["encoding"],
): string {
  const dataMark = marks.find(isMatrixDataMark);
  return (
    dataMark?.field ??
    encoding?.value?.field ??
    "value"
  );
}

function readAxisVisibility(marks: MatrixMarkSpec[]): boolean | undefined {
  const axisMarks = marks.filter((mark) => mark.type === "axis");
  if (axisMarks.length === 0) return undefined;
  return axisMarks.some((mark) => mark.show !== false);
}

/**
 * Compile matrix `marks[]` + encoding to HeatmapChart props (RFC-004 C186).
 */
export function blockMarksToMatrixProps(
  rows: Record<string, unknown>[],
  rawMarks: MatrixMarkSpec[] | unknown[],
  encoding: PanelSpec["encoding"] = {},
): MatrixHeatmapChartProps {
  const marks = normalizeMatrixMarks(rawMarks as unknown[]);
  const valueField = readValueField(marks, encoding);
  const xField = encoding?.x?.field ?? "x";
  const yEncoding = Array.isArray(encoding?.y) ? encoding.y[0] : encoding?.y;
  const yField = yEncoding?.field ?? "y";

  const colorScale = marks.find((mark) => mark.type === "colorScale");
  const showAxes = readAxisVisibility(marks);

  return {
    matrix: matrixFromRows(rows, xField, yField, valueField),
    ...(colorScale?.min != null ? { min: colorScale.min } : {}),
    ...(colorScale?.max != null ? { max: colorScale.max } : {}),
    ...(showAxes != null ? { showAxes } : {}),
  };
}
