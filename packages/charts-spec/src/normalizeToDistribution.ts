import type { PanelSpec } from "./types";
import type { DistributionMarkSpec } from "./types";
import { normalizeDistributionMarks } from "./distributionMarks";

export type NormalizedDistributionSpec = PanelSpec & {
  type: "distribution";
  marks: DistributionMarkSpec[];
};

/**
 * Normalize legacy pie/donut panels to `type: "distribution"` + marks[].
 */
export function normalizeToDistribution(spec: PanelSpec): NormalizedDistributionSpec {
  if (spec.type === "distribution") {
    return {
      ...spec,
      type: "distribution",
      marks: normalizeDistributionMarks((spec.marks ?? []) as unknown[]),
    };
  }

  if (spec.type === "funnel") {
    const props = spec.props ?? {};
    const angleField =
      spec.encoding?.angle?.field ??
      spec.encoding?.value?.field ??
      (typeof props.valueKey === "string" ? props.valueKey : undefined) ??
      "value";
    const colorField =
      spec.encoding?.color?.field ??
      spec.encoding?.name?.field ??
      (typeof props.nameKey === "string" ? props.nameKey : undefined) ??
      "name";

    const marks: DistributionMarkSpec[] = [
      { type: "funnel", field: angleField },
      { type: "label", show: true },
    ];

    return {
      ...spec,
      type: "distribution",
      encoding: {
        ...spec.encoding,
        angle: spec.encoding?.angle ?? { field: angleField, type: "quantitative" },
        color: spec.encoding?.color ?? { field: colorField, type: "nominal" },
      },
      marks,
    };
  }

  const props = spec.props ?? {};
  const angleField =
    spec.encoding?.angle?.field ??
    spec.encoding?.value?.field ??
    (typeof props.valueKey === "string" ? props.valueKey : undefined) ??
    "value";
  const colorField =
    spec.encoding?.color?.field ??
    spec.encoding?.name?.field ??
    (typeof props.nameKey === "string" ? props.nameKey : undefined) ??
    "name";

  const marks: DistributionMarkSpec[] = [
    { type: "arc", field: angleField },
  ];

  const innerRadius =
    typeof props.innerRadius === "number"
      ? props.innerRadius
      : spec.type === "donut"
        ? 42
        : undefined;

  if (innerRadius != null || spec.type === "donut") {
    marks.push({ type: "donut", innerRadius: innerRadius ?? 42 });
  }

  if (props.showLabels !== false) {
    marks.push({ type: "label", show: true });
  }

  return {
    ...spec,
    type: "distribution",
    encoding: {
      ...spec.encoding,
      angle: spec.encoding?.angle ?? { field: angleField, type: "quantitative" },
      color: spec.encoding?.color ?? { field: colorField, type: "nominal" },
    },
    marks,
  };
}
