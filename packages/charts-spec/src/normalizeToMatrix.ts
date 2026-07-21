import type { PanelSpec } from "./types";
import type { MatrixMarkSpec } from "./types";
import { normalizeMatrixMarks } from "./matrixMarks";

export type NormalizedMatrixSpec = PanelSpec & {
  type: "matrix";
  marks: MatrixMarkSpec[];
};

/**
 * Normalize legacy heatmap panels to `type: "matrix"` + marks[] (RFC-004 C186).
 */
export function normalizeToMatrix(spec: PanelSpec): NormalizedMatrixSpec {
  if (spec.type === "matrix") {
    return {
      ...spec,
      type: "matrix",
      marks: normalizeMatrixMarks((spec.marks ?? []) as unknown[]),
    };
  }

  const props = spec.props ?? {};
  const xField =
    spec.encoding?.x?.field ??
    (typeof props.xField === "string" ? props.xField : undefined) ??
    "x";
  const yEncoding = Array.isArray(spec.encoding?.y)
    ? spec.encoding.y[0]
    : spec.encoding?.y;
  const yField =
    yEncoding?.field ??
    (typeof props.yField === "string" ? props.yField : undefined) ??
    "y";
  const valueField =
    spec.encoding?.value?.field ??
    (typeof props.valueField === "string" ? props.valueField : undefined) ??
    "value";

  const marks: MatrixMarkSpec[] = [
    { type: "cell", field: valueField },
    { type: "colorScale", field: valueField },
    { type: "axis", dimension: "x", show: true },
    { type: "axis", dimension: "y", show: true },
  ];

  return {
    ...spec,
    type: "matrix",
    encoding: {
      ...spec.encoding,
      x: spec.encoding?.x ?? { field: xField, type: "nominal" },
      y: spec.encoding?.y ?? { field: yField, type: "nominal" },
      value: spec.encoding?.value ?? { field: valueField, type: "quantitative" },
    },
    marks,
  };
}
