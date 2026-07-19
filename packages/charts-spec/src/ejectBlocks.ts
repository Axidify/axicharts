import type { PanelSpec } from "./types";
import { readPanelAnimation, animationToSpecField } from "./panelAnimation";
import { readPanelLiveAnimate } from "./panelLiveAnimate";
import { ejectGraphicsProp } from "./panelGraphics";

function markComponent(type: string): "Bar" | "Line" | "Area" {
  if (type === "area") return "Area";
  if (type === "bar") return "Bar";
  return "Line";
}

function blocksChartFlags(spec: PanelSpec): string[] {
  const flags: string[] = [];
  if (spec.valueSuffix) flags.push(`valueSuffix="${spec.valueSuffix}"`);
  if (spec.props?.showValues === true) flags.push("showValues");
  const dualAxis = spec.props?.dualAxis;
  if (dualAxis === true) flags.push("dualAxis");
  else if (dualAxis === false) flags.push("dualAxis={false}");
  else if (dualAxis === "auto") flags.push('dualAxis="auto"');
  const animation = animationToSpecField(readPanelAnimation(spec));
  if (animation) flags.push(`animate={${JSON.stringify(animation)}}`);
  const liveAnimate = readPanelLiveAnimate(spec);
  if (liveAnimate) flags.push(`liveAnimate="${liveAnimate}"`);
  const graphics = ejectGraphicsProp(spec);
  if (graphics) flags.push(graphics);
  return flags;
}

/** Imperative ComboChart body — opt-in via `ejectPanel(..., { style: "imperative" })`. */
export function ejectBlocksImperativeBody(spec: PanelSpec, dataVar: string): string {
  const xField = spec.encoding?.x?.field ?? "category";
  const marks = spec.marks ?? [];
  const lines = marks
    .filter((mark) => mark.type === "line" || mark.type === "bar" || mark.type === "area")
    .map((mark) => {
      const kind = mark.type === "bar" ? "bar" : "line";
      const name = mark.label ?? mark.field;
      const tone = mark.tone ? `, tone: ${JSON.stringify(mark.tone)}` : "";
      const yAxisId = mark.yAxisId ? `, yAxisId: ${JSON.stringify(mark.yAxisId)}` : "";
      const fill = mark.type === "area" ? ", fill: true" : "";
      const curve =
        mark.curve && mark.type !== "bar"
          ? `, curve: ${JSON.stringify(mark.curve)}`
          : "";
      return `  { name: ${JSON.stringify(name)}, kind: "${kind}", data: ${dataVar}.map((row) => Number(row.${mark.field}))${tone}${yAxisId}${fill}${curve} }`;
    });

  const flags = blocksChartFlags(spec);
  const ruleMarks = marks.filter((mark) => mark.type === "rule");
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

  const bandMarks = marks.filter((mark) => mark.type === "band");
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

  const flagBlock =
    flags.length > 0 ? `\n    ${flags.join("\n    ")}` : "";

  return `categories={${dataVar}.map((row) => String(row.${xField}))}
    series={[\n${lines.join(",\n")},\n]}${flagBlock}`;
}

/** Default composable `CartesianChart` + block children. */
export function ejectBlocksComposableBody(spec: PanelSpec, dataVar: string): string {
  const xField = spec.encoding?.x?.field ?? "category";
  const marks = spec.marks ?? [];
  const dataMarks = marks
    .filter((mark) => mark.type === "line" || mark.type === "bar" || mark.type === "area")
    .map((mark) => {
      const Mark = markComponent(mark.type);
      const attrs = [
        `dataKey="${mark.field}"`,
        mark.label ? `name={${JSON.stringify(mark.label)}}` : "",
        mark.tone ? `tone="${mark.tone}"` : "",
        mark.curve && mark.type !== "bar" ? `type="${mark.curve}"` : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `    <${Mark} ${attrs} />`;
    })
    .join("\n");

  const overlayMarks = marks
    .filter((mark) => mark.type === "rule" || mark.type === "band")
    .map((mark) => {
      if (mark.type === "rule") {
        const attrs = [
          `value={${mark.value}}`,
          mark.label ? `label={${JSON.stringify(mark.label)}}` : "",
          mark.tone ? `tone="${mark.tone}"` : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `    <Rule ${attrs} />`;
      }
      const attrs = [
        `min={${mark.min}}`,
        `max={${mark.max}}`,
        mark.label ? `label={${JSON.stringify(mark.label)}}` : "",
        mark.tone ? `tone="${mark.tone}"` : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `    <Band ${attrs} />`;
    })
    .join("\n");

  const flags = blocksChartFlags(spec);
  const flagBlock =
    flags.length > 0 ? `\n    ${flags.join("\n    ")}\n` : "\n";

  return `data={${dataVar}}${flagBlock}  >
    <Grid />
    <XAxis dataKey="${xField}" />
    <YAxis />
${dataMarks}
${overlayMarks}
  </CartesianChart>`;
}

/** @deprecated Use `ejectBlocksComposableBody` or `ejectBlocksImperativeBody`. */
export function ejectBlocksBody(spec: PanelSpec, dataVar: string): string {
  return ejectBlocksImperativeBody(spec, dataVar);
}

export function ejectBlocksImports(style: "composable" | "imperative"): string[] {
  if (style === "imperative") {
    return ["ComboChart"];
  }
  return [
    "CartesianChart",
    "Grid",
    "XAxis",
    "YAxis",
    "Bar",
    "Line",
    "Area",
    "Rule",
    "Band",
  ];
}
