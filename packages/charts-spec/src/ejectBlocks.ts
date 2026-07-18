import type { PanelSpec } from "./types";
import { readPanelAnimation, animationToSpecField } from "./panelAnimation";
import { readPanelLiveAnimate } from "./panelLiveAnimate";
import { ejectGraphicsProp } from "./panelGraphics";
import { marksCurve } from "./blockMarks";

function marksSeriesBlock(spec: PanelSpec, dataVar: string): string {
  const marks = spec.marks ?? [];
  if (marks.length === 0) {
    return `[{ name: "value", kind: "bar", data: ${dataVar}.map((row) => Number(row.value)) }]`;
  }

  const lines = marks
    .filter((mark) => mark.type === "line" || mark.type === "bar" || mark.type === "area")
    .map((mark) => {
      const kind = mark.type === "bar" ? "bar" : "line";
      const name = mark.label ?? mark.field;
      const tone = mark.tone ? `, tone: ${JSON.stringify(mark.tone)}` : "";
      const yAxisId = mark.yAxisId ? `, yAxisId: ${JSON.stringify(mark.yAxisId)}` : "";
      return `  { name: ${JSON.stringify(name)}, kind: "${kind}", data: ${dataVar}.map((row) => Number(row.${mark.field}))${tone}${yAxisId} }`;
    });

  return `[\n${lines.join(",\n")},\n]`;
}

function blocksFlags(spec: PanelSpec): string[] {
  const flags: string[] = [];
  if (spec.fill || (spec.marks ?? []).some((mark) => mark.type === "area")) {
    flags.push("fill");
  }
  if (spec.valueSuffix) flags.push(`valueSuffix="${spec.valueSuffix}"`);
  if (spec.props?.showValues === true) flags.push("showValues");
  const dualAxis = spec.props?.dualAxis;
  if (dualAxis === true) flags.push("dualAxis");
  else if (dualAxis === false) flags.push("dualAxis={false}");
  else if (dualAxis === "auto") flags.push('dualAxis="auto"');
  const curve = marksCurve(spec.marks ?? []) ?? spec.props?.style?.line?.curve;
  if (curve === "linear" || curve === "monotone") {
    flags.push(`curve="${curve}"`);
  }
  const animation = animationToSpecField(readPanelAnimation(spec));
  if (animation) flags.push(`animate={${JSON.stringify(animation)}}`);
  const liveAnimate = readPanelLiveAnimate(spec);
  if (liveAnimate) flags.push(`liveAnimate="${liveAnimate}"`);
  const graphics = ejectGraphicsProp(spec);
  if (graphics) flags.push(graphics);

  const ruleMarks = (spec.marks ?? []).filter((mark) => mark.type === "rule");
  if (ruleMarks.length > 0) {
    flags.push(
      `referenceLines={${JSON.stringify(
        ruleMarks.map((mark) => ({
          value: mark.value,
          label: mark.label,
          tone: mark.tone,
          orientation: mark.orientation,
        })),
      )}}`,
    );
  }

  const bandMarks = (spec.marks ?? []).filter((mark) => mark.type === "band");
  if (bandMarks.length > 0) {
    flags.push(
      `thresholdBands={${JSON.stringify(
        bandMarks.map((mark) => ({
          min: mark.min,
          max: mark.max,
          label: mark.label,
          tone: mark.tone,
        })),
      )}}`,
    );
  }

  return flags;
}

export function ejectBlocksBody(spec: PanelSpec, dataVar: string): string {
  const xField = spec.encoding?.x?.field ?? "category";
  const flags = blocksFlags(spec);
  const flagBlock =
    flags.length > 0 ? `\n    ${flags.join("\n    ")}` : "";

  return `categories={${dataVar}.map((row) => String(row.${xField}))}
    series={${marksSeriesBlock(spec, dataVar)}}${flagBlock}`;
}

export function ejectBlocksComposableBody(spec: PanelSpec, dataVar: string): string {
  const xField = spec.encoding?.x?.field ?? "category";
  const marks = spec.marks ?? [];
  const markLines = marks
    .filter((mark) => mark.type === "line" || mark.type === "bar" || mark.type === "area")
    .map((mark) => {
      const Mark = mark.type === "bar" ? "Bar" : mark.type === "area" ? "Area" : "Line";
      const attrs = [
        `dataKey="${mark.field}"`,
        mark.label ? `name={${JSON.stringify(mark.label)}}` : "",
        mark.tone ? `tone="${mark.tone}"` : "",
        mark.curve && mark.type !== "bar" ? `type="${mark.curve}"` : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `      <${Mark} ${attrs} />`;
    })
    .join("\n");

  const flags = blocksFlags(spec).filter(
    (flag) => !flag.startsWith("referenceLines") && !flag.startsWith("thresholdBands"),
  );
  const flagBlock =
    flags.length > 0 ? `\n    ${flags.join("\n    ")}` : "";

  return `data={${dataVar}}
    ${flagBlock}
  >
    <XAxis dataKey="${xField}" />
    <YAxis />
${markLines}`;
}
