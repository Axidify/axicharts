import type { PanelSpec } from "./types";
import { readPanelAnimation, animationToSpecField } from "./panelAnimation";
import { readPanelLiveAnimate } from "./panelLiveAnimate";

function comboSeriesBlock(spec: PanelSpec, dataVar: string): string {
  const encoding = spec.encoding;
  const xField = encoding?.x?.field ?? "category";
  const yEncodings = Array.isArray(encoding?.y)
    ? encoding.y
    : encoding?.y
      ? [encoding.y]
      : [];

  if (yEncodings.length === 0) {
    return `[{ name: "value", kind: "bar", data: ${dataVar}.map((row) => Number(row.value)) }]`;
  }

  const lines = yEncodings.map((item, index) => {
    const name = item.label ?? item.field;
    const kind = item.kind ?? (index === 0 ? "bar" : "line");
    return `  { name: ${JSON.stringify(name)}, kind: "${kind}", data: ${dataVar}.map((row) => Number(row.${item.field})) }`;
  });

  return `[\n${lines.join(",\n")},\n]`;
}

function comboFlags(spec: PanelSpec): string[] {
  const flags: string[] = [];
  if (spec.fill) flags.push("fill");
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
  return flags;
}

export function ejectComboBody(spec: PanelSpec, dataVar: string): string {
  const xField = spec.encoding?.x?.field ?? "category";
  const flags = comboFlags(spec);
  const flagBlock =
    flags.length > 0 ? `\n    ${flags.join("\n    ")}` : "";

  return `categories={${dataVar}.map((row) => String(row.${xField}))}
    series={${comboSeriesBlock(spec, dataVar)}}${flagBlock}`;
}
