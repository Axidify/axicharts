import type { PanelSpec } from "./types";
import { normalizeDistributionMarks } from "./distributionMarks";
import { isDistributionDataMark } from "./distributionMarks";

function readDataField(spec: PanelSpec): string {
  const marks = normalizeDistributionMarks((spec.marks ?? []) as unknown[]);
  const dataMark = marks.find(isDistributionDataMark);
  return (
    dataMark?.field ??
    spec.encoding?.angle?.field ??
    spec.encoding?.value?.field ??
    "value"
  );
}

function readColorField(spec: PanelSpec): string {
  return spec.encoding?.color?.field ?? spec.encoding?.name?.field ?? "name";
}

function usesFunnelMark(spec: PanelSpec): boolean {
  const marks = normalizeDistributionMarks((spec.marks ?? []) as unknown[]);
  return marks.some((mark) => mark.type === "funnel");
}

export function distributionUsesComposableMarks(spec: PanelSpec): boolean {
  const marks = normalizeDistributionMarks((spec.marks ?? []) as unknown[]);
  return marks.some((mark) => mark.type === "cell");
}

export function ejectDistributionImports(spec: PanelSpec): string[] {
  if (usesFunnelMark(spec)) {
    return ["FunnelChart"];
  }
  if (distributionUsesComposableMarks(spec)) {
    return ["PieChart", "Pie", "Cell"];
  }
  return ["PieChart"];
}

export function ejectDistributionComposableBody(spec: PanelSpec, dataVar: string): string {
  if (usesFunnelMark(spec)) {
    const angleField = readDataField(spec);
    const colorField = readColorField(spec);
    const marks = normalizeDistributionMarks((spec.marks ?? []) as unknown[]);
    const funnel = marks.find((mark) => mark.type === "funnel");
    const sortAttr =
      funnel?.type === "funnel" && funnel.sort ? ` sort="${funnel.sort}"` : "";

    return `data={${dataVar}}
  >
    <Funnel dataKey="${angleField}" nameKey="${colorField}"${sortAttr} />
  </FunnelChart>`;
  }

  const angleField = readDataField(spec);
  const colorField = readColorField(spec);
  const marks = normalizeDistributionMarks((spec.marks ?? []) as unknown[]);
  const donut = marks.find((mark) => mark.type === "donut");
  const label = marks.find((mark) => mark.type === "label");
  const cells = marks.filter((mark) => mark.type === "cell");

  const pieAttrs = [
    `dataKey="${angleField}"`,
    `nameKey="${colorField}"`,
    donut ? `innerRadius={${donut.innerRadius ?? 42}}` : "",
    label?.show !== false ? "showLabels" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cellLines =
    cells.length > 0
      ? cells
          .map((cell) => {
            const attrs = [
              `dataKey={${JSON.stringify(cell.dataKey)}}`,
              cell.tone ? `tone="${cell.tone}"` : "",
              cell.color ? `color={${JSON.stringify(cell.color)}}` : "",
            ]
              .filter(Boolean)
              .join(" ");
            return `    <Cell ${attrs} />`;
          })
          .join("\n")
      : `    {${dataVar}.map((row) => (
      <Cell key={String(row.${colorField})} dataKey={String(row.${colorField})} />
    ))}`;

  return `data={${dataVar}}
  >
    <Pie ${pieAttrs}>
${cellLines}
    </Pie>
  </PieChart>`;
}

export function ejectDistributionImperativeBody(spec: PanelSpec, dataVar: string): string {
  const angleField = readDataField(spec);
  const colorField = readColorField(spec);
  const marks = normalizeDistributionMarks((spec.marks ?? []) as unknown[]);
  const funnel = marks.find((mark) => mark.type === "funnel");

  if (funnel) {
    const sortAttr = funnel.sort ? `\n    sort="${funnel.sort}"` : "";
    return `stages={${dataVar}.map((row) => ({
      name: String(row.${colorField}),
      value: Number(row.${angleField}),
    }))}${sortAttr}`;
  }

  const donut = marks.find((mark) => mark.type === "donut");
  const label = marks.find((mark) => mark.type === "label");
  const innerRadius = donut?.innerRadius ?? spec.innerRadius;
  const showLabels = label?.show !== false;

  const lines = [
    `slices={${dataVar}.map((row) => ({
      name: String(row.${colorField}),
      value: Number(row.${angleField}),
    }))}`,
    innerRadius != null ? `innerRadius={${innerRadius}}` : "",
    showLabels ? "showLabels" : "",
  ].filter(Boolean);

  return lines.join("\n    ");
}

export function ejectDistributionBody(
  spec: PanelSpec,
  dataVar: string,
  style: "composable" | "imperative",
): string {
  return style === "composable"
    ? ejectDistributionComposableBody(spec, dataVar)
    : ejectDistributionImperativeBody(spec, dataVar);
}
